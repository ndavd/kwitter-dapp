import { BrowserProvider } from 'ethers'

export interface PhantomEthereum extends BrowserProvider {}
export interface MetaMaskEthereum extends BrowserProvider {
  isMetaMask?: boolean
}

export interface KweetType {
  id: number
  author: string
  hashprint: string
  content: string
  voteCount: number
  timestamp: number
  hasVoted: boolean
}

export enum SortBy {
  NEWEST = 'newest',
  MOST_VOTED = 'most voted'
}

export enum Wallet {
  PHANTOM = 'Phantom',
  METAMASK = 'MetaMask'
}
