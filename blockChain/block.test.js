const Block = require("./block");
const DIFFICULTY = require("../config");
describe("Block", () => {
  let data, lastblock, block;
  beforeAll(() => {
    data = "foo";
    lastblock = Block.genesis();
    block = Block.mineBlock(lastblock, data);
  });
  it("sets the `data` to match the output", () => {
    expect(block.data).toEqual("foo");
  });
  it("Match the hashcode for lastBlock", () => {
    expect(block.lastHash).toEqual(lastblock.hash);
  });
  it("generates a hash that matches the difficulty", () => {
    // console.log(JSON.stringify(Block.hash()).substring(0, DIFFICULTY));
    expect(block.hash.toString().substring(0, block.difficulty)).toEqual(
      "0".repeat(block.difficulty)
    );
  });
  it("lowers the difficulty level for slowly mined blocks", () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 36000)).toEqual(
      block.difficulty - 1
    );
  });
  it("raise the difficulty level for Fast mined blocks", () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 1)).toEqual(
      block.difficulty + 1
    );
  });
});
