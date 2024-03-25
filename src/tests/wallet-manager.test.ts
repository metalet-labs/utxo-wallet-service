import { Chain } from "@/wallet-manager/types";
import { mnemonic } from "./config";
import { WalletManager } from "@/wallet-manager";

describe("test wallet manager", () => {
  let walletManager: WalletManager;

  const name = "Wallet A";

  beforeAll(() => {
    walletManager = new WalletManager({
      network: "testnet",
      walletsOptions: [{ name, mnemonic, addressIndices: [0] }],
    });
  });

  test("test wallet btc address and path", () => {
    const accounts = walletManager.getWallet(name, Chain.BTC);
    for (let account of accounts) {
      for (let wallet of account.children) {
        const address = wallet.getAddress();
        const path = wallet.getPath();
        console.log({ address, path });
      }
    }
  });
});
