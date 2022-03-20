const Kwitter = artifacts.require("Kwitter");
const Web3 = require("web3");
require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Kwitter", ([deployer, user1, user2, user3]) => {
  let contract, web3;

  before(async () => {
    contract = await Kwitter.new();
    web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
  });

  describe("Deployment", async () => {
    it("contract has an owner", async () => {
      const owner = await contract.owner();
      assert.equal(owner, deployer);
    })

    it("contract has the right properties", async () => {
      const totalKweets = await contract.totalKweets();
      assert.equal(totalKweets.toString(), 0);

      const kweetPrice = await contract.kweetPrice();
      assert.equal(kweetPrice.toString(), Web3.utils.toWei('0.01', 'ether'));

      const votePrice = await contract.votePrice();
      assert.equal(votePrice.toString(), Web3.utils.toWei('0.002', 'ether'));
    })
  });

  describe("kweet()", async () => {
    let result;
    const content =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, " +
      "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

    before(async () => {
      result = await contract.kweet(content, { from: user1, value: web3.utils.toWei('0.01', 'ether') });
    })

    it("can kweet", async () => {
      const totalKweets = await contract.totalKweets();
      assert.equal(totalKweets.toString(), "1");
    })

    it("kweet cost requirement is working", async () => {
      await contract.kweet(content, { from: user1, value: web3.utils.toWei('0.005', 'ether') }).should.be.rejected;
    })

    it("kweet length requirement is working", async () => {
      await contract.kweet("", { from: user1, value: web3.utils.toWei('0.01', 'ether') }).should.be.rejected;
      await contract.kweet(" ".repeat(300), { from: user1, value: web3.utils.toWei('0.01', 'ether') }).should.be.rejected;
    })

    it("kweet has the right properties", async () => {
      const kweet = await contract.kweets("1");
      const now = new Date().getTime().toString().slice(0,-3);
      const kweetDate = +kweet.timestamp;

      assert.equal(kweet.id.toString(), "1");
      assert.equal(kweet.author.toString(), user1);
      assert.equal(kweet.content.toString(), content);
      assert.equal(kweet.voteCount.toString(), "0");

      // now >= kweetDate && now < (kweetDate + 10secs)
      assert.isAtLeast(+now, kweetDate);
      assert.isBelow(+now, kweetDate + 10);
    })

    it("getAccountKweets(). accounts storage is working", async () => {
      await contract.kweet(content, { from: user2, value: web3.utils.toWei('0.01', 'ether') });
      await contract.kweet(content, { from: user1, value: web3.utils.toWei('0.01', 'ether') });

      const kweets = await contract.getAccountKweets(user1);
      assert.equal(kweets.length, "2");
      assert.equal(kweets[1], "3");
    })
  });

  describe("vote()", async () => {
    let result;
    const author = user1;
    const voter = user2;

    before(async () => {
      result = await contract.vote(1, { from: voter, value: web3.utils.toWei('0.002', 'ether') });
    })

    it("can vote", async () => {
      const kweet = await contract.kweets("1");
      assert.equal(kweet.voteCount.toString(), "1");
    })

    it("vote cost requirement is working", async () => {
      await contract.vote(1, { from: user3, value: web3.utils.toWei('0.001', 'ether') }).should.be.rejected;
    })

    it("valid id requirement is working", async () => {
      await contract.vote(0, { from: user3, value: web3.utils.toWei('0.002', 'ether') }).should.be.rejected;
      const totalKweets = await contract.totalKweets();
      await contract.vote(totalKweets+1, { from: user3, value: web3.utils.toWei('0.002', 'ether') }).should.be.rejected;
    })

    it("cannot vote own kweet requirement is working", async () => {
      await contract.vote(1, { from: author, value: web3.utils.toWei('0.002', 'ether') }).should.be.rejected;
    })

    it("voting only once requirement is working", async () => {
      await contract.vote(1, { from: voter, value: web3.utils.toWei('0.002', 'ether') }).should.be.rejected;
    })

    it("hasVoted mapping is working", async () => {
      const voter = user3;

      let hasVoted = await contract.hasVoted(voter, "1");
      assert.equal(hasVoted, false);

      await contract.vote(1, { from: voter, value: web3.utils.toWei('0.002', 'ether') });
      hasVoted = await contract.hasVoted(voter, "1");
      assert.equal(hasVoted, true);
    })
  })

  describe("deleteKweet()", async () => {
    it("can delete kweet", async () => {
      let kweet = await contract.kweets("1");
      assert.equal(kweet.id.toString(), "1");

      await contract.deleteKweet("1");
      kweet = await contract.kweets("1");
      assert.equal(kweet.id.toString(), "0");
    })

    it("only owner requirement is working", async () => {
      await contract.deleteKweet("2", { from: user1 }).should.be.rejected;
    })
  })

  describe("withdraw()", async () => {
    it("can withdraw", async () => {
      const oldContractBalance = await web3.eth.getBalance(contract.address);
      const oldOwnerBalance = await web3.eth.getBalance(deployer);

      await contract.withdraw();
      const newContractBalance = await web3.eth.getBalance(contract.address);
      const newOwnerBalance = await web3.eth.getBalance(deployer);

      assert.equal(
        (+web3.utils.fromWei(oldContractBalance, 'ether') * 0.05).toFixed(7),
        (+web3.utils.fromWei(newContractBalance, 'ether')).toFixed(7)
      );
      assert.isAbove(+newOwnerBalance, +oldOwnerBalance);
    })

    it("only owner requirement is working", async () => {
      await contract.withdraw({ from: user1 }).should.be.rejected;
    })
  })
});
