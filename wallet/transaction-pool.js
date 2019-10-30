const Transaction = require("../wallet/transaction");

class TransactionPool {
  constructor() {
    this.transactions = [];
  }
  updateOrAddTransaction(transaction) {
    let transactionwithId = this.transactions.find(
      t => t.id === transaction.id
    );
    if (transactionwithId) {
      this.transactions[
        this.transactions.indexOf(transactionwithId)
      ] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }
  existingTransaction(address) {
    return this.transactions.find(
      transaction => transaction.input.address === address
    );
  }
  validTransactions() {
    return this.transactions.filter(transaction => {
      const outputTotal = transaction.output.reduce((total, output) => {
        return total + output.amount;
      }, 0);

      if (transaction.input.amount !== outputTotal) {
        console.log(`Invalid transaction from ${transaction.input.address}.`);
        return;
      }

      if (!Transaction.verifyTransaction(transaction)) {
        console.log(`Invalid signature from ${transaction.input.address}.`);
        return;
      }

      return transaction;
    });
  }
  clear() {
    this.transactions = [];
  }
}
module.exports = TransactionPool;
