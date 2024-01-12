import { MetaMaskEthereum, PhantomEthereum } from './types'

declare global {
  interface Window {
    ethereum?: MetaMaskEthereum
    phantom?: {
      ethereum: PhantomEthereum
    }
  }
}
