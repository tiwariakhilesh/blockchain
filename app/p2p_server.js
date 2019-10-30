const WebSocket = require("ws");
const P2P_PORT = process.argv[3] || 5001;
const peers = process.argv[4] ? process.argv[4].split(",") : [];
const MESSAGE_TYPE = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  clearTransactions: "CLEARTRANSACTIONS"
};
class P2pserver {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.socket = [];
  }
  listen() {
    const server = new WebSocket.Server({ port: P2P_PORT });
    server.on("connection", socket => this.connectionSocket(socket));
    this.connectToPeers();
    console.log(`listening to peer to peer connection on ${P2P_PORT}`);
  }
  connectToPeers() {
    peers.forEach(peer => {
      const socket = new WebSocket(peer);
      socket.on("open", () => this.connectionSocket(socket));
    });
  }
  connectionSocket(socket) {
    this.socket.push(socket);
    console.log("socket connected");
    this.messageHandler(socket);
    this.sendChains(socket);
  }
  sendChains(socket) {
    socket.send(
      JSON.stringify({ type: MESSAGE_TYPE.chain, chain: this.blockchain.chain })
    );
  }
  sendTransaction(socket, transaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.transaction,
        transaction
      })
    );
  }

  messageHandler(socket) {
    socket.on("message", message => {
      const data = JSON.parse(message);
      console.log(data);
      switch (data.type) {
        case MESSAGE_TYPE.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPE.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPE.clearTransactions:
          this.transactionPool.clear();
      }
    });
  }
  syncChains() {
    if (this.socket.length)
      this.socket.forEach(socket => this.sendChains(socket));
  }
  broadcastTransaction(transaction) {
    if (this.socket.length)
      this.socket.forEach(socket => this.sendTransaction(socket, transaction));
  }
  broadcastClearTransactions() {
    if (this.socket.length) {
      this.socket.forEach(socket =>
        socket.send(
          JSON.stringify({
            type: MESSAGE_TYPE.clearTransactions
          })
        )
      );
    }
  }
}
module.exports = P2pserver;
