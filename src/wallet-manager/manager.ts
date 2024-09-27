import Decimal from "decimal.js";
import { BtcService } from "@/service-btc";
import { formatIndex, genUID } from "./tools";
import { MvcService, type mvcCoinType } from "@/service-mvc";
import { BaseWallet, type Net, BtcHotWallet } from "@metalet/utxo-wallet-sdk";
import {
  Chain,
  type Manager,
  type HotManager,
  type WalletOptions,
  type AccountOptions,
  type HotWalletOptions,
} from "./types";

const _initWallet = Symbol("_initWallet");
const _initAccount = Symbol("_initAccount");

class WalletManager {
  #network: Net;
  #chains: Chain[];
  #manager: Manager;

  constructor({
    network,
    walletsOptions,
    chains = Object.values(Chain),
  }: {
    network: Net;
    chains?: Chain[];
    walletsOptions: WalletOptions[];
  }) {
    this.#chains = chains;
    this.#network = network;
    this.#manager = Object.fromEntries(
      walletsOptions.map((walletOptions, index) => {
        const walletId = walletOptions.id || genUID();
        const name = walletOptions.name
          ? walletOptions.name
          : `Wallet ${formatIndex(index + 1)}`;
        return [walletId, this[_initWallet]({ ...walletOptions, name })];
      })
    );
  }

  [_initAccount]({
    name,
    seed,
    mnemonic,
    mvcTypes,
    addressIndex,
  }: {
    name: string;
    seed?: Buffer;
    mnemonic: string;
    addressIndex: number;
    mvcTypes?: mvcCoinType[];
  }) {
    return {
      name,
      addressIndex,
      chainWallets: Object.fromEntries(
        Object.values(this.#chains).map((chain) => [
          chain,
          getChainWallets({
            seed,
            chain,
            mnemonic,
            mvcTypes,
            addressIndex,
            network: this.#network,
          }),
        ])
      ),
    };

    function getChainWallets({
      seed,
      chain,
      network,
      mnemonic,
      mvcTypes,
      addressIndex,
    }: {
      chain: Chain;
      network: Net;
      seed?: Buffer;
      mnemonic: string;
      addressIndex: number;
      mvcTypes?: mvcCoinType[];
    }) {
      switch (chain) {
        case Chain.BTC:
          return new BtcService().createAccount({
            seed,
            network,
            mnemonic,
            mvcTypes,
            addressIndex,
          });
        case Chain.MVC:
          return new MvcService().createAccount({
            seed,
            network,
            mnemonic,
            mvcTypes,
            addressIndex,
          });
        default:
          throw new Error(`Unsupported chain type: ${chain}.`);
      }
    }
  }

  [_initWallet](
    walletOptions: Omit<WalletOptions, "name"> & {
      name: string;
    }
  ) {
    if ([null, undefined, ""].includes(walletOptions.mnemonic)) {
      throw new Error("[initWallet]: Mnemonic is required");
    }
    const {
      name,
      seed,
      mnemonic,
      accountsOptions,
      mvcTypes = [10001],
    } = walletOptions;
    return {
      name,
      mnemonic,
      mvcTypes,
      balance: new Decimal(0),
      accounts: Object.fromEntries(
        accountsOptions.map(
          ({ id: accountId, name: accountName, addressIndex }, index) => [
            accountId || genUID(),
            this[_initAccount]({
              seed,
              mnemonic,
              mvcTypes,
              addressIndex,
              name: accountName || `Account ${formatIndex(index + 1)}`,
            }),
          ]
        )
      ),
    };
  }

  getWalletCount() {
    return Object.keys(this.#manager).length;
  }

  getWalletAccountCount(walletId: string) {
    return Object.keys(this.#manager[walletId]["accounts"]).length;
  }

  addWallet(walletOptions: WalletOptions) {
    if ([null, undefined, ""].includes(walletOptions.mnemonic)) {
      throw new Error("[addWallet]: Mnemonic is required");
    }
    if (
      Object.values(this.#manager).findIndex(
        (wallet) => wallet.mnemonic === walletOptions.mnemonic
      ) !== -1
    ) {
      throw new Error("Wallet already exists");
    }
    const index = this.getWalletCount();
    const name = walletOptions.name
      ? walletOptions.name
      : `Wallet ${formatIndex(index + 1)}`;
    const wallet = this[_initWallet]({ ...walletOptions, name });
    const walletId = walletOptions.id || genUID();
    this.#manager = {
      ...this.#manager,
      [walletId]: wallet,
    };
    return {
      id: walletId,
      name,
      mnemonic: walletOptions.mnemonic,
      mvcTypes: wallet.mvcTypes,
      accounts: Object.entries(wallet.accounts).map(([accountId, account]) => ({
        id: accountId,
        name: account.name,
        addressIndex: account.addressIndex,
      })),
    };
  }

  findWallet(mnemonic: string) {
    const wallet = Object.values(this.#manager).find(
      (w) => w.mnemonic === mnemonic
    );

    if (!wallet) {
      throw new Error(`Wallet with mnemonic "${mnemonic}" not found.`);
    }

    const walletId = Object.keys(this.#manager).find(
      (id) => this.#manager[id] === wallet
    );

    return {
      id: walletId!,
      name: wallet.name,
      mnemonic: wallet.mnemonic,
      mvcTypes: wallet.mvcTypes,
      accounts: Object.entries(wallet.accounts).map(([accountId, account]) => ({
        id: accountId,
        name: account.name,
        addressIndex: account.addressIndex,
      })),
    };
  }

  addAccount(walletId: string, accountOptions: AccountOptions) {
    const { addressIndex, name: accountName } = accountOptions;
    const wallet = this.#manager[walletId];

    if (!wallet) {
      throw new Error(`Wallet with id "${walletId}" does not exist`);
    }

    const existingAccount = Object.values(wallet.accounts).find(
      (account) => account.addressIndex === addressIndex
    );

    if (existingAccount) {
      throw new Error("Account already exists");
    }
    // console.log(wallet.accounts);

    // console.log(Object.keys(wallet.accounts).length);

    const name = accountName || `Account ${formatIndex(addressIndex + 1)}`;

    const account = this[_initAccount]({
      name,
      addressIndex,
      mnemonic: wallet.mnemonic,
      mvcTypes: wallet.mvcTypes,
    });
    const accountId = accountOptions.id || genUID();

    this.#manager[walletId].accounts[accountId] = account;
    return { id: accountId, name, addressIndex };
  }

  getWallets() {
    return Object.entries(this.#manager).map(([walletId, wallet]) => ({
      id: walletId,
      name: wallet.name,
      balance: wallet.balance.toNumber(),
      accounts: Object.entries(wallet.accounts).map(([accountId, account]) => ({
        id: accountId,
        name: account.name,
        ...Object.fromEntries(
          Object.entries(account["chainWallets"])
            .filter(([key]) => Object.values(Chain).includes(key as Chain))
            .map(([chain, baseWallets]) => [
              chain,
              (baseWallets as BaseWallet[]).map((baseWallet) => ({
                path: baseWallet.getPath(),
                address: baseWallet.getAddress(),
                addressType: baseWallet.getAddressType(),
              })),
            ])
        ),
      })),
    }));
  }

  getAccountChainWallets(walletId: string, accountId: string) {
    return this.#manager[walletId].accounts[accountId]["chainWallets"];
  }

  // getAccountChainWallets(walletId: string, accountId: string) {
  //   return Object.fromEntries(
  //     Object.entries(
  //       this.#manager[walletId].accounts[accountId]["chainWallets"]
  //     )
  //       .filter(([key]) => Object.values(Chain).includes(key as Chain))
  //       .map(([chain, baseWallets]) => [
  //         chain,
  //         (baseWallets as BaseWallet[]).map((baseWallet) => ({
  //           path: baseWallet.getPath(),
  //           address: baseWallet.getAddress(),
  //           addressType: baseWallet.getAddressType(),
  //         })),
  //       ])
  //   );
  // }
}

class HotWalletManager {
  private network: Net;
  private manager: HotManager;

  constructor({
    network,
    walletsOptions,
  }: {
    network: Net;
    walletsOptions: HotWalletOptions[];
  }) {
    this.network = network;
    this.manager = Object.fromEntries(
      walletsOptions.map((walletOptions, index) => {
        const walletId = walletOptions.id || genUID();
        return [
          walletId,
          {
            name: walletOptions.name
              ? walletOptions.name
              : `Wallet ${formatIndex(index + 1)}`,
            wallet: new BtcHotWallet({
              network: this.network,
              publicKey: walletOptions.publicKey,
              addressType: walletOptions.addressType,
            }),
          },
        ];
      })
    );
  }

  getWalletCount() {
    return Object.keys(this.manager).length;
  }

  addWallet(walletOptions: HotWalletOptions) {
    if (walletOptions.id) {
      const wallet = this.manager[walletOptions.id];
      if (wallet) {
        throw new Error(`Wallet with id "${walletOptions.id}" already exists.`);
      }
    }

    const walletId = walletOptions.id || genUID();
    this.manager[walletId] = {
      name: walletOptions.name
        ? walletOptions.name
        : `Wallet ${formatIndex(this.getWalletCount() + 1)}`,
      wallet: new BtcHotWallet({
        network: this.network,
        publicKey: walletOptions.publicKey,
        addressType: walletOptions.addressType,
      }),
    };
  }

  getWallets() {
    return Object.entries(this.manager).map(([walletId, wallet]) => ({
      id: walletId,
      name: wallet.name,
      publicKey: wallet.wallet.getPublicKey(),
      addressType: wallet.wallet.getAddressType(),
    }));
  }
}

export { WalletManager, HotWalletManager };
