import { BaseService } from "@/service-base";
import { mvcCoinType } from "@/service-mvc/types";
import {
  BtcWallet,
  type Net,
  AddressType,
  CoinType,
} from "@metalet/utxo-wallet-sdk";

class BtcService extends BaseService {
  createAccount({
    network,
    mnemonic,
    addressIndex,
    mvcTypes = [10001],
  }: {
    network: Net;
    mnemonic: string;
    addressIndex: number;
    mvcTypes?: mvcCoinType[];
  }) {
    const btcWallets: BtcWallet[] = [];
    const addressTypes = [
      AddressType.Legacy,
      AddressType.NativeSegwit,
      AddressType.NestedSegwit,
      AddressType.Taproot,
    ];
    for (let addressType of addressTypes) {
      const btcWallet = new BtcWallet({
        network,
        mnemonic,
        addressType,
        addressIndex,
        coinType: CoinType.BTC,
      });
      btcWallets.push(btcWallet);
    }
    for (let mvcType of mvcTypes) {
      const btcWallet = new BtcWallet({
        network,
        mnemonic,
        addressType: AddressType.SameAsMvc,
        addressIndex,
        coinType: mvcType,
      });
      btcWallets.push(btcWallet);
    }
    return btcWallets;
  }
}

export { BtcService };
