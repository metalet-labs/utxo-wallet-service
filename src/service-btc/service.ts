import { BaseService } from "@/service-base";
import { BtcWallet, type Net, AddressType } from "utxo-wallet-sdk";

class BtcService extends BaseService {
  send() {
    return Promise.resolve();
  }

  createAccount({
    network,
    mnemonic,
    addressIndex,
  }: {
    network: Net;
    mnemonic: string;
    addressIndex: number;
  }) {
    const btcWallets: BtcWallet[] = [];
    const addressTypes = Object.values(AddressType);
    for (let addressType of addressTypes) {
      const btcWallet = new BtcWallet({
        network,
        mnemonic,
        addressType,
        addressIndex,
      });
      btcWallets.push(btcWallet);
    }
    return btcWallets;
  }
}

export { BtcService };
