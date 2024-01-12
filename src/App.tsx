import { BrowserProvider, Eip1193Provider, ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Kwitter, Kwitter__factory } from '../typechain-types'
import Nav from './components/Nav'
import NotFound from './components/NotFound'
import Root from './components/Root'
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX } from './constants'
import kwitterJson from './Kwitter.json'
import { Wallet } from './types'

const App = () => {
  const [selectedWallet, setSelectedWallet] = useState<Wallet>()
  const [isSepolia, setIsSepolia] = useState(false)
  const [account, setAccount] = useState<string>()
  const [owner, setOwner] = useState<string>()
  const [connected, setConnected] = useState(false)

  const [contract, setContract] = useState<Kwitter>(
    Kwitter__factory.connect(
      kwitterJson.address,
      ethers.getDefaultProvider(SEPOLIA_CHAIN_ID)
    )
  )

  const hasPhantomWallet = Boolean(window.phantom)
  const hasMetaMaskWallet = Boolean(window.ethereum?.isMetaMask)
  const hasWallet = hasPhantomWallet || hasMetaMaskWallet

  const ethereum = useMemo(() => {
    if (!selectedWallet) return undefined
    if (hasPhantomWallet && selectedWallet == Wallet.PHANTOM) {
      return window.phantom!.ethereum as BrowserProvider
    }
    if (hasMetaMaskWallet && selectedWallet == Wallet.METAMASK) {
      return window.ethereum as BrowserProvider
    }
  }, [hasMetaMaskWallet, hasPhantomWallet, selectedWallet])

  const provider = useMemo(
    () =>
      ethereum
        ? new BrowserProvider(ethereum as unknown as Eip1193Provider)
        : null,
    [ethereum]
  )

  const getAccount = useCallback(
    async (overrideProvider?: BrowserProvider) => {
      const accounts: string[] = await (overrideProvider ?? provider)?.send(
        'eth_accounts',
        []
      )
      const acc =
        accounts.length > 0 ? ethers.getAddress(accounts[0]) : undefined
      setAccount(acc)
      return acc
    },
    [provider]
  )

  const requestSepolia = useCallback(
    async (overrideProvider?: BrowserProvider) => {
      try {
        await (overrideProvider ?? provider)?.send(
          'wallet_switchEthereumChain',
          [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
        )
      } catch (err) {
        console.error(err)
      }
    },
    [provider]
  )

  const load = useCallback(async () => {
    if (!ethereum || !provider) return

    const net = await provider.provider.getNetwork()
    setIsSepolia(net.chainId == SEPOLIA_CHAIN_ID)

    await getAccount(provider)

    const kwitter = Kwitter__factory.connect(
      kwitterJson.address,
      await provider.getSigner()
    )
    setContract(kwitter)
    setConnected(true)
  }, [getAccount, ethereum, provider])

  const handleConnect = useCallback(async () => {
    try {
      await provider?.send('eth_requestAccounts', [])
      await getAccount()
      await load()
    } catch (err) {
      console.error(err)
    }
  }, [load, getAccount, provider])

  const attemptAutoConnection = useCallback(async () => {
    if (!hasWallet) return
    // Try phantom
    if (hasPhantomWallet) {
      const ethereum = window.phantom!.ethereum as BrowserProvider
      const provider = new BrowserProvider(
        ethereum as unknown as Eip1193Provider
      )
      const account = await getAccount(provider)
      if (account) {
        setSelectedWallet(Wallet.PHANTOM)
        return
      }
    }
    // Try metamask
    if (hasMetaMaskWallet) {
      const ethereum = window.ethereum as BrowserProvider
      const provider = new BrowserProvider(
        ethereum as unknown as Eip1193Provider
      )
      const net = await provider.provider.getNetwork()
      if (net.chainId != SEPOLIA_CHAIN_ID) await requestSepolia(provider)
      const account = await getAccount(provider)
      if (account) {
        setSelectedWallet(Wallet.METAMASK)
        return
      }
    }
  }, [
    getAccount,
    requestSepolia,
    hasWallet,
    hasMetaMaskWallet,
    hasPhantomWallet
  ])

  useEffect(() => {
    if (!account || !ethereum) return
    ethereum.on('accountsChanged', () => {
      window.location.reload()
    })
    ethereum.on('chainChanged', () => {
      window.location.reload()
    })
  }, [account, ethereum])

  useEffect(() => {
    if (selectedWallet) handleConnect()
  }, [selectedWallet, handleConnect])

  useEffect(() => {
    attemptAutoConnection().then(load)
  }, [attemptAutoConnection, load])

  useEffect(() => {
    contract.owner().then(setOwner)
  }, [contract])

  return (
    <BrowserRouter>
      <Nav
        account={account}
        provider={provider}
        isSepolia={isSepolia}
        hasMetaMaskWallet={hasMetaMaskWallet}
        hasPhantomWallet={hasPhantomWallet}
        onWalletSelect={setSelectedWallet}
      />
      <Routes>
        <Route
          path='/'
          element={
            <Root
              account={account}
              contract={contract}
              owner={owner}
              connected={connected}
              hasWallet={hasWallet}
            />
          }
        />
        <Route path='/*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
