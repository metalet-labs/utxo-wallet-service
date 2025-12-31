import { mvcCoinType } from "@/service-mvc/types";
import {
  DogeWallet,
  type Net,
  AddressType,
} from "@metalet/utxo-wallet-sdk";

class DogeService {
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
    const dogeWallets: DogeWallet[] = [];

    // DogeSameAsMvc - default, uses MVC path for MetaID support
    // Use the first mvcType (which could be custom like 236)
    const mvcCoinType = mvcTypes[0] || 10001;
    const dogeWallet = new DogeWallet({
      seed,
      network,
      mnemonic,
      addressIndex,
      addressType: AddressType.DogeSameAsMvc,
      coinType: mvcCoinType,
    });
    seed = seed ? seed : dogeWallet.getSeed();
    dogeWallets.push(dogeWallet);

    // LegacyDoge - traditional DOGE path m/44'/3'/0'/0/x
    const legacyDogeWallet = new DogeWallet({
      seed,
      network,
      mnemonic,
      addressIndex,
      addressType: AddressType.LegacyDoge,
    });
    dogeWallets.push(legacyDogeWallet);

    return dogeWallets;
  }
}

export { DogeService };
