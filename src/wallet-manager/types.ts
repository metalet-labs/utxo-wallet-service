import Decimal from "decimal.js";
import { mvcCoinType } from "@/service-mvc";
import {
  type Net,
  BaseWallet,
  ScriptType,
  AddressType,
  BtcHotWallet,
  DogeWallet,
} from "@metalet/utxo-wallet-sdk";

export type { mvcCoinType, Net };

export { ScriptType };

export enum Chain {
  BTC = "btc",
  MVC = "mvc",
  DOGE = "doge",
}

export type Account = {
  name: string;
  addressIndex: number;
  chainWallets: { 
    [Chain.BTC]?: BaseWallet[];
    [Chain.MVC]?: BaseWallet[];
    [Chain.DOGE]?: DogeWallet[];
  };
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
  seed?: Buffer;
  mnemonic: string;
  mvcTypes?: mvcCoinType[];
  accountsOptions: AccountOptions[];
}

export interface AccountOptions {
  id?: string;
  name?: string; // account name
  addressIndex: number;
}

export interface HotManager {
  [walletId: string]: {
    name: string;
    wallet: BtcHotWallet;
  };
}

export interface HotWalletOptions {
  id?: string;
  chain: Chain;
  name?: string; // wallet name
  publicKey: string;
  addressType: AddressType;
}
