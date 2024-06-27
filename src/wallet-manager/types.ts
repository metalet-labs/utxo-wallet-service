import Decimal from "decimal.js";
import { mvcCoinType } from "@/service-mvc";
import {
  type Net,
  BaseWallet,
  ScriptType,
  AddressType,
  BtcHotWallet,
} from "@metalet/utxo-wallet-sdk";

export type { mvcCoinType, Net };

export { ScriptType };

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
