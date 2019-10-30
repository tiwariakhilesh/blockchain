const Chainutil = require("../chain-util");
const { DIFFICULTY, MINE_RATE } = require("../config");
class Block {
  constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
  }
  toString() {
    return `Block-
        timestamp:${this.timestamp},
        lastHash: ${this.lastHash},
        hash: ${this.hash},
        nonce:${this.nonce},
        difficulty: ${this.difficulty},
        data:${this.data}`;
  }
  static genesis() {
    return new this("genesis", "-----", "fir84h-hasur", [], 0, DIFFICULTY);
  }
  static mineBlock(lastBlock, data) {
    let nonce = 0;
    let timestamp, hash;
    const lastHash = lastBlock.hash;
    let difficulty = lastBlock.difficulty;
    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
      // console.log(hash.toString().substring(0, difficulty));
    } while (
      hash.toString().substring(0, difficulty) !== "0".repeat(difficulty)
    );
    console.log(hash.toString().substring(0, difficulty));
    return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }
  static hash(timestamp, lastHash, data, nonce, difficulty) {
    return Chainutil.hash(
      `${timestamp}${lastHash}${data}${nonce}${difficulty}`
    );
  }
  static blockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    // console.log(timestamp, lastHash, data);
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }
  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock;
    difficulty =
      lastBlock.timestamp + MINE_RATE > currentTime
        ? difficulty + 1
        : difficulty - 1;
    return difficulty;
  }
}
module.exports = Block;
