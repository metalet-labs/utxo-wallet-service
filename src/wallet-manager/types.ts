import type { Account } from "@/service-base";

export enum Chain {
  BTC = "btc",
  MVC = "mvc",
}

export type Wallet = {
  [chain in Chain]: Account[];
};

export interface Manager {
  [name: string]: Wallet;
}

export interface WalletOptions {
  name: string;
  mnemonic: string;
  mvcTypes?: number[];
  addressIndices: number[];
}

export interface AccountOptions {
  mnemonic: string;
  addressIndex: number;
}
