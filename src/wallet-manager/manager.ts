import { type Net } from "utxo-wallet-sdk";
import { MvcService } from "@/service-mvc";
import { type Account } from "@/service-base";
import { BtcService } from "@/service-bitcoin";
import {
  Chain,
  type Wallet,
  type Manager,
  type WalletOptions,
  type AccountOptions,
} from "./types";

function getWalletKey(walletOptions: WalletOptions): string {
  return `${walletOptions.name}-${walletOptions.mnemonic}`;
}

function hasDuplicateWalletOptions(walletOptions: WalletOptions[]): boolean {
  const walletKeys = new Set<string>();

  for (const options of walletOptions) {
    const key = getWalletKey(options);
    if (walletKeys.has(key)) {
      console.error(`Duplicate wallet options found: ${options.name}`);
      return true;
    }
    walletKeys.add(key);
  }

  return false;
}

const _initWallet = Symbol("_initWallet");

class WalletManager {
  #network: Net;
  #chains: Chain[];
  #manager: Manager;
  #walletsOptions: WalletOptions[];

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
    if (hasDuplicateWalletOptions(walletsOptions)) {
      throw new Error("Array contains duplicate wallet options");
    }
    this.#walletsOptions = walletsOptions;
    this.#manager = Object.fromEntries(
      walletsOptions.map((walletOptions) => [
        walletOptions.name,
        this[_initWallet]({ network, walletOptions, chains }),
      ])
    );
  }

  [_initWallet]({
    chains,
    network,
    walletOptions,
  }: {
    network: Net;
    chains: Chain[];
    walletOptions: WalletOptions;
  }) {
    const { mnemonic, addressIndices, mvcTypes } = walletOptions;

    const wallet = Object.fromEntries(
      Object.values(chains).map((chain) => [chain, [] as Account[]])
    ) as Wallet;

    for (const chain of chains) {
      switch (chain) {
        case Chain.BTC:
          const bitcService = new BtcService();
          wallet[Chain.BTC] = addressIndices.map((addressIndex) =>
            bitcService.createAccount({ network, mnemonic, addressIndex })
          );
          break;
        case Chain.MVC:
          const mvcService = new MvcService();
          wallet[Chain.MVC] = addressIndices.map((addressIndex) =>
            mvcService.createAccount({
              network,
              mnemonic,
              addressIndex,
              mvcTypes,
            })
          );
          break;
        default:
          throw new Error(`Unsupported chain type: ${chain}.`);
      }
    }
    return wallet;
  }

  addWallet({
    walletOptions,
    chains = Object.values(Chain),
  }: {
    chains: Chain[];
    mvcTypes?: number[];
    walletOptions: WalletOptions;
  }) {
    if (
      this.#walletsOptions.findIndex(
        (_walletsOptions) => _walletsOptions.mnemonic === walletOptions.mnemonic
      ) !== -1
    ) {
      throw new Error("Wallet already exists");
    }
    const wallet = this[_initWallet]({
      chains,
      walletOptions,
      network: this.#network,
    });
    this.#manager = { ...this.#manager, [walletOptions.name]: wallet };
  }

  addAccount(accountOptions: AccountOptions) {
    const walletOption = this.#walletsOptions.find(
      (_walletsOptions) => _walletsOptions.mnemonic === accountOptions.mnemonic
    );
    if (!walletOption) {
      throw new Error("Wallet doesn't exist");
    }
    if (walletOption.addressIndices.includes(accountOptions.addressIndex)) {
      throw new Error("Account already exists");
    }
    const { name, mvcTypes } = walletOption;
    const { mnemonic, addressIndex } = accountOptions;
    for (const chain of this.#chains) {
      switch (chain) {
        case Chain.BTC:
          this.#manager[name][Chain.BTC] = [
            ...this.#manager[name][Chain.BTC],
            new BtcService().createAccount({
              network: this.#network,
              mnemonic,
              addressIndex,
            }),
          ];
          break;
        case Chain.MVC:
          this.#manager[name][Chain.MVC] = [
            ...this.#manager[name][Chain.MVC],
            new MvcService().createAccount({
              mnemonic,
              mvcTypes,
              addressIndex,
              network: this.#network,
            }),
          ];
          break;
        default:
          throw new Error(`Unsupported chain type: ${chain}.`);
      }
    }
  }

  getWallet(name:string,chain:Chain) {
    return this.#manager[name][chain];
  }
}

export { WalletManager };
