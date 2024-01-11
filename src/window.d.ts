import { BrowserProvider } from 'ethers'

interface Ethereum extends BrowserProvider {
  isMetaMask?: boolean
}

declare global {
  interface Window {
    ethereum?: Ethereum
  }
}
