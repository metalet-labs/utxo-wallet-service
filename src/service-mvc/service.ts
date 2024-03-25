import { BaseService } from "@/service-base";
import { MvcWallet, type Net } from "utxo-wallet-sdk";

class MvcService extends BaseService {
  send() {
    return Promise.resolve();
  }

  createAccount({
    network,
    mnemonic,
    addressIndex,
    mvcTypes = [10001],
  }: {
    network: Net;
    mnemonic: string;
    mvcTypes?: number[];
    addressIndex: number;
  }) {
    const mvcWallets: MvcWallet[] = [];
    for (let coinType of mvcTypes) {
      const mvcWallet = new MvcWallet({
        network,
        mnemonic,
        addressIndex,
        coinType,
      });
      mvcWallets.push(mvcWallet);
    }
    return {
      network,
      mnemonic,
      children: mvcWallets,
    };
  }
}

export { MvcService };
