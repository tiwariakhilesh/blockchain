const Wallet = require("./index");
const TransactionPool = require("./transaction-pool");
const BlockChain = require("../blockChain");
describe("Wallet", () => {
  let wallet, tp, blc;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    blc = new BlockChain();
  });

  describe("creating a transaction", () => {
    let transaction, sendAmount, recipient;
    beforeEach(() => {
      sendAmount = 50;
      recipient = "r4nd0m-4ddr3s";
      transaction = wallet.createTransaction(recipient, sendAmount, blc, tp);
    });

    describe("and doing the same transaction", () => {
      beforeEach(() => {
        wallet.createTransaction(recipient, sendAmount, blc, tp);
      });

      it("doubles the `sendAmount` subtracted from the wallet balance", () => {
        expect(
          transaction.output.find(output => output.address === wallet.publicKey)
            .amount
        ).toEqual(wallet.balance - sendAmount * 2);
      });

      it("clones the `sendAmount` output for the recipient", () => {
        expect(
          transaction.output
            .filter(output => output.address === recipient)
            .map(output => output.amount)
        ).toEqual([sendAmount, sendAmount]);
      });
    });
  });
});
