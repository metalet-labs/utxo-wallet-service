import { mnemonic, mnemonic2 } from "./config";
import { WalletManager } from "@/wallet-manager";

describe("test wallet manager", () => {
  let walletManager: WalletManager;

  beforeAll(() => {
    walletManager = new WalletManager({
      network: "testnet",
      walletsOptions: [{ mnemonic, accountsOptions: [{ addressIndex: 0 }] }],
    });
  });

  test("test wallet manager get wallets", () => {
    const wallets = walletManager.getWallets();
    console.log(wallets);
  });

  test("test wallet manager add wallet", () => {
    walletManager.addWallet({
      mnemonic: mnemonic2,
      accountsOptions: [{ addressIndex: 0 }],
    });
    const wallets = walletManager.getWallets();
    console.log(wallets);
  });

  test("test wallet manager add account", () => {
    let wallets = walletManager.getWallets();
    const walletId = wallets[0].id;
    walletManager.addAccount(walletId, {
      addressIndex: 1,
    });
    wallets = walletManager.getWallets();
    console.log(wallets);
  });
});
