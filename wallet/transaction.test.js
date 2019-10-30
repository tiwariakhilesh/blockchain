const Transaction = require("./transaction");
const Wallet = require("./index");

describe("Transaction", () => {
  let transaction, amount, wallet, recipient;
  beforeEach(() => {
    wallet = new Wallet();
    amount = 50;
    recipient = "r1c1p13nt";
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });
  it("it outputs the amount subtracted from wallet balance", () => {
    expect(
      transaction.output.find(output => output.address === wallet.publicKey)
        .amount
    ).toEqual(wallet.balance - amount);
  });
  it("it outputs the amount added to recipient wallet", () => {
    expect(
      transaction.output.find(output => output.address === recipient).amount
    ).toEqual(amount);
  });
  it("it checks the input object amount equal to wallet balnce", () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });
  it("validates a transaction", () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });
  it("validates a corrupt transaction", () => {
    transaction.output[0].amount = 100;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });
  describe("transacting amount exceeds balance", () => {
    beforeEach(() => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });
    it("wont create a trasaction", () => {
      expect(transaction).toEqual(undefined);
    });
  });
  describe("and updating a transaction", () => {
    let nextAmount, nextRecipient;
    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = "n3xt-4ddr355";
      transaction = transaction.update(wallet, nextRecipient, nextAmount);
    });

    it(`subtracts the next amount from the sender’s output`, () => {
      expect(
        transaction.output.find(output => output.address === wallet.publicKey)
          .amount
      ).toEqual(wallet.balance - amount - nextAmount);
    });

    it("outputs an amount for the next recipient", () => {
      expect(
        transaction.output.find(output => output.address === nextRecipient)
          .amount
      ).toEqual(nextAmount);
    });
  });
});
