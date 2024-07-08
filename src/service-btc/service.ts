import { BaseService } from "@/service-base";
import { mvcCoinType } from "@/service-mvc/types";
import {
  BtcWallet,
  type Net,
  AddressType,
  CoinType,
  SignType,
} from "@metalet/utxo-wallet-sdk";

class BtcService extends BaseService {
  createAccount({
    seed,
    network,
    mnemonic,
    addressIndex,
    mvcTypes = [10001],
  }: {
    network: Net;
    seed?: Buffer;
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
        seed,
        network,
        mnemonic,
        addressType,
        addressIndex,
        coinType: CoinType.BTC,
      });
      seed = seed ? seed : btcWallet.getSeed();
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
