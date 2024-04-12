import { BaseService } from "@/service-base";
import { BtcWallet, type Net, AddressType } from "@metalet/utxo-wallet-sdk";

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
    const addressTypes = [
      AddressType.Legacy,
      AddressType.NativeSegwit,
      AddressType.NestedSegwit,
      AddressType.Taproot,
      AddressType.SameAsMvc,
    ];
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
