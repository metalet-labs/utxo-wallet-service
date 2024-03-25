import { BaseWallet, type Net } from "utxo-wallet-sdk";

export interface Account {
  network: Net;
  mnemonic: string;
  children: BaseWallet[];
}
