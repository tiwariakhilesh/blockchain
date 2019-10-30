const BlockChain = require("./index");
const Block = require("./block");

describe("BlockChain", () => {
  let blc, blc2;
  beforeEach(() => {
    blc = new BlockChain();
    blc2 = new BlockChain();
  });
  it("genesis block testing", () => {
    expect(blc.chain[0]).toEqual(Block.genesis());
  });
  it("addBlock testing", () => {
    const data = "foo";
    blc.addBlock(data);
    expect(blc.chain[blc.chain.length - 1].data).toEqual(data);
  });
  it("validates a new chain", () => {
    blc2.addBlock("foo");
    expect(blc.isValidChain(blc2.chain)).toBe(true);
  });
  it("invalidates a chain with a corrupt genesis block", () => {
    blc2.chain[0].data = "Bad data";
    expect(blc.isValidChain(blc2.chain)).toBe(false);
  });

  it("invalidates a corrupt chain", () => {
    blc2.addBlock("foo");
    blc2.chain[1].data = "Not foo";
    expect(blc.isValidChain(blc2.chain)).toBe(false);
  });
  it("replaces a valid chain", () => {
    blc2.addBlock("goo");
    blc.replaceChain(blc2.chain);
    expect(blc.chain).toEqual(blc2.chain);
  });
  it("does not replace the chain with one of less than or equal length", () => {
    blc.addBlock("foo");
    blc.replaceChain(blc2.chain);
    expect(blc.chain).not.toEqual(blc2.chain);
  });
});
