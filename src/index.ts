import { genUID, formatIndex } from "./wallet-manager/tools";
import {
  CoinType,
  SignType,
  BtcWallet,
  MvcWallet,
  BaseWallet,
  AddressType,
} from "@metalet/utxo-wallet-sdk";

export { genUID, formatIndex };
export * from "./wallet-manager";
export { BtcWallet, MvcWallet, BaseWallet, AddressType, CoinType, SignType };
