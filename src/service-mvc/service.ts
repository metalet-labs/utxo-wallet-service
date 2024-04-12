import { mvcCoinType } from "./types";
import { BaseService } from "@/service-base";
import { AddressType, CoinType, MvcWallet, type Net } from "@metalet/utxo-wallet-sdk";

class MvcService extends BaseService {
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
    const mvcWallets: MvcWallet[] = [];
    for (let coinType of mvcTypes) {
      const addressType =
        coinType === CoinType.MVC
          ? AddressType.LegacyMvc
          : AddressType.LegacyMvcCustom;
      const mvcWallet = new MvcWallet({
        network,
        mnemonic,
        coinType,
        addressType,
        addressIndex,
      });
      mvcWallets.push(mvcWallet);
    }
    return mvcWallets;
  }
}

export { MvcService };
