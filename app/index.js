const BlockChain = require("../blockChain");
const express = require("express");
const bodyParser = require("body-parser");
const HTTP_PORT = process.argv[2] ? process.argv[2] : 3001;
const P2pserver = require("./p2p_server");
const TransactionPool = require("../wallet/transaction-pool");
const Wallet = require("../wallet");
const Miner = require("./Miner");
const tp = new TransactionPool();
const wallet = new Wallet();

const app = express();
const blc = new BlockChain();
const p2pserver = new P2pserver(blc, tp);
const miner = new Miner(blc, tp, wallet, p2pserver);
app.use(bodyParser.json());

app.get("/blocks", (req, res) => {
  res.json(blc.chain);
});
app.post("/mine", (req, res) => {
  const block = blc.addBlock(req.body.data);
  console.log(`New block has been added ${block.toString()}`);
  p2pserver.syncChains();
  res.redirect("/blocks");
});
app.get("/transactions", (req, res) => {
  res.json(tp.transactions);
});
app.post("/transact", (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, blc, tp);
  p2pserver.broadcastTransaction(transaction);
  res.redirect("/transactions");
});
app.get("/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});
app.get("/mine-transactions", (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);
  res.redirect("/blocks");
});
app.listen(HTTP_PORT, () => console.log(`Listening to port ${HTTP_PORT}`));
p2pserver.listen();
