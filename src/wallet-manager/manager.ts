import Decimal from "decimal.js";
import { BtcService } from "@/service-btc";
import { formatIndex, genUID } from "./tools";
import { BaseWallet, type Net } from "utxo-wallet-sdk";
import { MvcService,type mvcCoinType } from "@/service-mvc";
import {
  Chain,
  type Manager,
  type WalletOptions,
  type AccountOptions,
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
    mnemonic,
    mvcTypes,
    addressIndex,
  }: {
    name: string;
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
      chain,
      network,
      mnemonic,
      mvcTypes,
      addressIndex,
    }: {
      chain: Chain;
      network: Net;
      mnemonic: string;
      addressIndex: number;
      mvcTypes?: mvcCoinType[];
    }) {
      switch (chain) {
        case Chain.BTC:
          return new BtcService().createAccount({
            network,
            mnemonic,
            addressIndex,
          });
        case Chain.MVC:
          return new MvcService().createAccount({
            network,
            mnemonic,
            addressIndex,
            mvcTypes,
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
    const {
      name,
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
    this.#manager = { ...this.#manager, [genUID()]: wallet };
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

    const name =
      accountName ||
      `Account ${formatIndex(Object.keys(wallet.accounts).length + 1)}`;
    const account = this[_initAccount]({
      name,
      mnemonic: wallet.mnemonic,
      mvcTypes: wallet.mvcTypes,
      addressIndex,
    });

    this.#manager[walletId].accounts[name] = account;
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
}

export { WalletManager };
