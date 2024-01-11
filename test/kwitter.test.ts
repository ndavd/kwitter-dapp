import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { deployments, ethers } from 'hardhat'

import { Kwitter } from '../typechain-types'

const kweetPrice = ethers.parseEther('0.01')
const votePrice = ethers.parseEther('0.002')

describe('Kwitter', () => {
  let deployer: HardhatEthersSigner
  let users: HardhatEthersSigner[]
  let kwitter: Kwitter
  let firstKweetAuthor: HardhatEthersSigner
  let voter: HardhatEthersSigner

  describe('Deployment', () => {
    it('Deploys', async () => {
      await deployments.fixture(['kwitter'])

      const signers = await ethers.getSigners()
      deployer = signers[0]
      users = signers.slice(1)
      firstKweetAuthor = users[0]
      voter = users[5]

      kwitter = await ethers.getContract('Kwitter')

      expect(kwitter).to.exist
    })

    it('Has the proper owner', async () => {
      expect(await kwitter.owner()).to.equal(deployer)
    })

    it('Has the right properties', async () => {
      expect(await kwitter.totalKweets()).to.equal(0)
      expect(await kwitter.kweetPrice()).to.equal(kweetPrice)
      expect(await kwitter.votePrice()).to.equal(votePrice)
    })
  })

  describe('kweet()', () => {
    const content =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
      'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    let timeToKweet: number

    before(async () => {
      timeToKweet = +new Date().getTime().toString().slice(0, -3)
      await kwitter.connect(firstKweetAuthor).kweet(content, {
        value: kweetPrice
      })
    })

    it('Can kweet', async () => {
      const totalKweets = await kwitter.totalKweets()
      expect(totalKweets).to.equal(1)
    })

    it('Kweet cost requirement is working', async () => {
      await expect(
        kwitter.kweet(content, {
          value: kweetPrice / BigInt(2)
        })
      ).to.be.revertedWith('Not enough paid')
    })

    it('Kweet length requirement is working', async () => {
      const invalidLengthMsg = 'Each kweet should have between 1 and 256 bytes'
      await expect(kwitter.kweet('', { value: kweetPrice })).to.be.revertedWith(
        invalidLengthMsg
      )
      await expect(
        kwitter.kweet(' '.repeat(300), { value: kweetPrice })
      ).to.be.revertedWith(invalidLengthMsg)
    })

    it('Kweet has the right properties', async () => {
      const kweet = await kwitter.kweets('1')

      expect(kweet.id).to.equal('1')
      expect(kweet.author).to.equal(users[0].address)
      expect(kweet.content).to.equal(content)
      expect(kweet.voteCount).to.equal('0')
      expect(kweet.timestamp).to.be.greaterThanOrEqual(timeToKweet)
    })

    it('getAccountKweets(). accounts storage is working', async () => {
      const user = users[2]
      await kwitter.connect(user).kweet(content, {
        value: kweetPrice
      })
      await kwitter.connect(user).kweet(content, {
        value: kweetPrice
      })

      const kweets = await kwitter.getAccountKweets(user)

      expect(kweets.length).to.equal(2)
      expect(kweets[1]).to.equal(3)
    })
  })

  describe('vote()', () => {
    before(async () => {
      await kwitter.connect(voter).vote(1, {
        value: votePrice
      })
    })

    it('Can vote', async () => {
      const kweet = await kwitter.kweets('1')
      expect(kweet.voteCount).to.equal(1)
    })

    it('Vote cost requirement is working', async () => {
      await expect(
        kwitter.connect(users[6]).vote(1, {
          value: votePrice / BigInt(2)
        })
      ).to.be.revertedWith('Not enough paid')
    })

    it('Valid id requirement is working', async () => {
      const invalidIdMsg = 'The kweet id is not valid'
      await expect(
        kwitter.connect(users[6]).vote(0, {
          value: votePrice
        })
      ).to.be.revertedWith(invalidIdMsg)
      const totalKweets = Number(await kwitter.totalKweets())
      await expect(
        kwitter.connect(users[6]).vote(totalKweets + 1, {
          value: votePrice
        })
      ).to.be.revertedWith(invalidIdMsg)
    })

    it('Cannot vote own kweet requirement is working', async () => {
      await expect(
        kwitter.connect(firstKweetAuthor).vote(1, {
          value: votePrice
        })
      ).to.be.revertedWith('The kweet author cannot vote his own kweet')
    })

    it('Voting only once requirement is working', async () => {
      await expect(
        kwitter.connect(voter).vote(1, {
          value: votePrice
        })
      ).to.be.revertedWith('Each account can only vote a kweet once')
    })

    it('hasVoted mapping is working', async () => {
      const voter = users[7]

      let hasVoted = await kwitter.hasVoted(voter, 1)
      expect(hasVoted).to.equal(false)

      await kwitter.connect(voter).vote(1, {
        value: votePrice
      })
      hasVoted = await kwitter.hasVoted(voter, 1)
      expect(hasVoted).to.equal(true)
    })
  })

  describe('deleteKweet()', () => {
    it('Can delete kweet', async () => {
      let kweet = await kwitter.kweets(1)
      expect(kweet.id).to.equal(1)

      await kwitter.deleteKweet(1)
      kweet = await kwitter.kweets(1)
      expect(kweet.id).to.equal(0)
    })

    it('Only owner requirement is working', async () => {
      await expect(kwitter.connect(users[0]).deleteKweet(2)).to.be.revertedWith(
        'Only the contract owner can perform this action'
      )
    })
  })
})
