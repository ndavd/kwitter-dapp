import { ethers } from 'ethers'
import hashprint from 'hashprintjs'

import { Kwitter } from '../typechain-types'
import { KweetType, SortBy, Wallet } from './types'

export const reduceAddress = (a: string): string => {
  if (a.endsWith('.eth')) return a
  return a.slice(0, 5) + '...' + a.slice(a.length - 4)
}

export const getHashprint = async (data: string, size: number) => {
  return hashprint({ data, size, likeness: [0.4, 0.2] })
}

export const getEns = async (a: string) => {
  return ethers.getDefaultProvider('mainnet').lookupAddress(a)
}

export const fetchOrderedKweets = async (
  contract: Kwitter,
  account: string,
  sortBy: SortBy = SortBy.NEWEST,
  list: bigint[] = []
) => {
  const fetchKweet = async (list: KweetType[], index: bigint) => {
    const k = await contract.kweets(index)
    if (Number(k.id) == 0) return

    const voted = await contract.hasVoted(account, k.id)
    list.push({
      id: Number(k.id),
      author: k.author,
      hashprint: await getHashprint(k.author, 64),
      content: k.content,
      voteCount: Number(k.voteCount),
      timestamp: Number(k.timestamp),
      hasVoted: voted
    })
  }

  const totalKweets = await contract.totalKweets()
  const kweets: KweetType[] = []

  if (list.length == 0) {
    for (let i = 0; i < totalKweets; i++) {
      await fetchKweet(kweets, BigInt(i + 1))
    }
  } else {
    for (let i = 0; i < list.length; i++) {
      await fetchKweet(kweets, list[i])
    }
  }

  kweets.reverse()

  if (sortBy == SortBy.MOST_VOTED) {
    kweets.sort((a, b) => b.voteCount - a.voteCount)
  }

  return kweets
}

export const getWalletUrl = (wallet: Wallet): string => {
  switch (wallet) {
    case Wallet.PHANTOM:
      return 'https://phantom.app/'
    case Wallet.METAMASK:
      return 'https://metamask.io/'
  }
}

export const getWalletImage = (wallet: Wallet) => `/${wallet.toLowerCase()}.webp`
