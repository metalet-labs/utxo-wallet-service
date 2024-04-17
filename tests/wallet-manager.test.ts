import { mnemonic, mnemonic2 } from "./config";
import { WalletManager } from "@/wallet-manager";

describe("WalletManager", () => {
  let walletManager: WalletManager;

  const walletName = "Custom Wallet";
  const accountName = "Custom Account";

  beforeAll(() => {
    walletManager = new WalletManager({
      network: "testnet",
      walletsOptions: [
        {
          mnemonic,
          name: walletName,
          mvcTypes: [10001, 236],
          accountsOptions: [{ addressIndex: 0, name: accountName }],
        },
      ],
    });
  });

  describe("getWalletCount", () => {
    it("should return the correct number of wallets", () => {
      expect(walletManager.getWalletCount()).toBe(1);
    });
  });

  describe("getWallets", () => {
    it("should return an array of wallets with their details", () => {
      const wallets = walletManager.getWallets();

      expect(wallets.length).toBe(1);
      expect(wallets[0].accounts.length).toBe(1);
      expect(wallets[0].name).toBe(walletName);
      expect(wallets[0].accounts.length).toBe(1);
      expect(wallets[0].accounts[0].name).toBe(accountName);
    });
  });

  describe("addWallet", () => {
    it("should add a new wallet to the manager", () => {
      const walletName2 = "Custom Wallet 2";
      const accountName2 = "Custom Account 2";
      walletManager.addWallet({
        name: walletName2,
        mnemonic: mnemonic2,
        accountsOptions: [
          { addressIndex: 0, name: accountName2 },
          { addressIndex: 1, name: accountName2 },
        ],
      });
      const wallets = walletManager.getWallets();
      expect(wallets.length).toBe(2);
      expect(wallets[1].name).toBe(walletName2);
    });
  });

  describe("addAccount", () => {
    it("should add a new account to the specified wallet", () => {
      const walletsBefore = walletManager.getWallets();
      const walletId = walletsBefore[0].id;
      walletManager.addAccount(walletId, {
        addressIndex: 1,
      });
      const walletsAfter = walletManager.getWallets();
      expect(walletsAfter[0].accounts.length).toBe(2);
    });
  });

  describe("getWallets", () => {
    it("should return an array of wallets with their details", () => {
      const wallets = walletManager.getWallets();
      console.log(wallets);
    });
  });
});
