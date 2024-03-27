import Decimal from "decimal.js";
import { BaseWallet } from "utxo-wallet-sdk";

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
  mvcTypes: number[];
  accounts: {
    [accountId: string]: Account;
  };
};

export interface Manager {
  [walletId: string]: Wallet;
}

export interface WalletOptions {
  name?: string; // wallet name
  mnemonic: string;
  mvcTypes?: number[];
  accountsOptions: AccountOptions[];
}

export interface AccountOptions {
  name?: string; // account name
  addressIndex: number;
}
