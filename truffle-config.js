require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  contracts_directory: './src/contracts',
  contracts_build_directory: './public/build',
  networks: {
    kovan: {
      provider: () => {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          "https://kovan.infura.io/v3/" + process.env.INFURA_API_KEY
        );
      },
      network_id: 42
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
  },
  compilers: {
    solc: {
      version: "^0.8.12",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
