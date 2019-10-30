const { INITIAL_BALANCE } = require("../config");
const Chainutil = require("../chain-util");
const Transaction = require("./transaction");
class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = Chainutil.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }
  toString() {
    return `wallet
        publicKey: ${this.publicKey.toString()}
        balance: ${this.balance}`;
  }
  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }
  createTransaction(recipient, amount, blockchain, transactionPool) {
    this.balance = this.calculateBalance(blockchain);
    if (amount > this.balance) {
      console.log(
        `Amount: ${amount}, exceeds current balance: ${this.balance}`
      );
      return;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);
    if (transaction) {
      transaction.update(this, recipient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recipient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }
  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.address = "blockchain-wallet";
    return blockchainWallet;
  }
  calculateBalance(blockchain) {
    let balance = this.balance;
    let transactions = [];
    blockchain.chain.forEach(block =>
      block.data.forEach(transaction => {
        transactions.push(transaction);
      })
    );
    const walletInputs = transactions.filter(
      transaction => transaction.input.address === this.publicKey
    );
    let startTime = 0;
    if (walletInputs.length > 0) {
      const recentInputT = walletInputs.reduce((prev, next) => {
        prev.input.timestamp > next.input.timestamp ? prev : next;
      });
      balance = recentInputT.output.find(
        output => output.address === this.publicKey
      ).amount;
      startTime = recentInputT.input.timestamp;
    }
    transactions.forEach(transaction => {
      if (transaction.input.timestamp > startTime) {
        transaction.output.find(output => {
          if (output.address === this.publicKey) {
            balance += output.amount;
          }
        });
      }
    });
    return balance;
  }
}
module.exports = Wallet;
