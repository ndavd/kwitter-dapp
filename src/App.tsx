import { BrowserProvider, Eip1193Provider, ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Kwitter, Kwitter__factory } from '../typechain-types'
import Account from './components/Account'
import Feed from './components/Feed'
import Home from './components/Home'
import LoaderAnimation from './components/LoaderAnimation'
import Nav from './components/Nav'
import NotFound from './components/NotFound'
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX } from './constants'
import useWindowWidth from './hooks/useWindowWidth'
import kwitterJson from './Kwitter.json'

const App = () => {
  const [account, setAccount] = useState<string>()
  const [owner, setOwner] = useState<string>()
  const [connected, setConnected] = useState(false)

  const [contract, setContract] = useState<Kwitter>(
    Kwitter__factory.connect(
      kwitterJson.address,
      ethers.getDefaultProvider(SEPOLIA_CHAIN_ID)
    )
  )

  const isMobile = useWindowWidth() < 640

  const hasMetaMask = window.ethereum?.isMetaMask ?? false

  const provider = useMemo(
    () =>
      window.ethereum
        ? new BrowserProvider(window.ethereum as object as Eip1193Provider)
        : null,
    []
  )

  const getAccount = useCallback(async () => {
    const accounts: string[] = await provider?.send('eth_accounts', [])
    setAccount(ethers.getAddress(accounts[0]))
  }, [provider])

  const requestSepolia = useCallback(async () => {
    try {
      await provider?.send('wallet_switchEthereumChain', [
        { chainId: SEPOLIA_CHAIN_ID_HEX }
      ])
    } catch (err) {
      console.error(err)
    }
  }, [provider])

  const handleConnect = useCallback(async () => {
    requestSepolia()
    try {
      // Request accounts
      await provider?.send('eth_requestAccounts', [])
      await getAccount()
    } catch (err) {
      console.error(err)
    }
  }, [getAccount, provider, requestSepolia])

  const load = useCallback(async () => {
    if (!provider) return

    window.ethereum?.on('accountsChanged', () => {
      window.location.reload()
    })

    window.ethereum?.on('chainChanged', () => {
      window.location.reload()
    })

    const net = await provider.provider.getNetwork()
    if (net.chainId == SEPOLIA_CHAIN_ID) {
      await getAccount()
    } else {
      await requestSepolia()
    }

    const kwitter = Kwitter__factory.connect(
      kwitterJson.address,
      await provider.getSigner()
    )
    setContract(kwitter)
    setConnected(true)
  }, [getAccount, provider, requestSepolia])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    contract.owner().then(setOwner)
  }, [contract])

  return (
    <Router>
      <Nav
        account={account}
        hasMetaMask={hasMetaMask}
        onConnect={handleConnect}
      />
      <Routes>
        <Route
          path='/'
          element={
            !account ? (
              <Home
                hasMetaMask={hasMetaMask}
                contract={contract}
                owner={owner}
              />
            ) : connected ? (
              <Feed
                account={account}
                contract={contract}
                isMobile={isMobile}
                owner={owner}
              />
            ) : (
              <LoaderAnimation py='5em' />
            )
          }
        />
        {account && (
          <Route
            path='/:address'
            element={
              contract ? (
                <Account account={account} contract={contract} owner={owner} />
              ) : (
                <LoaderAnimation py='5em' />
              )
            }
          />
        )}
        <Route path='/*' element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
