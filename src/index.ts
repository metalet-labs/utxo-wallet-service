export * from "./wallet-manager";
export { genUID, formatIndex } from "./wallet-manager/tools";
export {
  CoinType,
  SignType,
  BtcWallet,
  MvcWallet,
  BaseWallet,
  AddressType,
  Transaction,
  type TxDetail,
  getAddressFromScript,
} from "@metalet/utxo-wallet-sdk";
