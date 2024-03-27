import { BtcWallet } from "utxo-wallet-sdk";
abstract class BaseService {
  abstract send(): Promise<unknown>;
  abstract createAccount(_: unknown): BtcWallet[];
}

export { BaseService };
