import 'dotenv/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-ethers'
import '@typechain/hardhat'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'

import { HardhatUserConfig } from 'hardhat/config'

const getSepoliaConfig = () => {
  const url = process.env.SEPOLIA_RPC_URL
  const deployer = process.env.SEPOLIA_DEPLOYER
  if (!url || !deployer) return {}
  return {
    sepolia: {
      chainId: 11155111,
      url,
      accounts: [deployer]
    }
  }
}

const config: HardhatUserConfig = {
  paths: {
    sources: './src/contracts'
  },
  mocha: {
    parallel: false,
    bail: true
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      accounts: {
        count: 20
      }
    },
    ...getSepoliaConfig()
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
}

export default config
