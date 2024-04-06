import Decimal from "decimal.js";
import { mvcCoinType } from "@/service-mvc";
import { BaseWallet } from "utxo-wallet-sdk";

export type { mvcCoinType };

export enum Chain {
  BTC = "btc",
  MVC = "mvc",
}

export type Account = {
  name: string;
  addressIndex: number;
  chainWallets: { [chain in Chain]?: BaseWallet[] };
};

export type Wallet = {
  name: string;
  balance: Decimal;
  mnemonic: string;
  mvcTypes: mvcCoinType[];
  accounts: {
    [accountId: string]: Account;
  };
};

export interface Manager {
  [walletId: string]: Wallet;
}

export interface WalletOptions {
  id?: string;
  name?: string; // wallet name
  mnemonic: string;
  mvcTypes?: mvcCoinType[];
  accountsOptions: AccountOptions[];
}

export interface AccountOptions {
  id?: string;
  name?: string; // account name
  addressIndex: number;
}
