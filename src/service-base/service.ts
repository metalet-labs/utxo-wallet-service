import { BaseWallet } from "@metalet/utxo-wallet-sdk";
abstract class BaseService {
  abstract createAccount(_: unknown): BaseWallet[];
}

export { BaseService };
