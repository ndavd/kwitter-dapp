import { BrowserProvider, Eip1193Provider, ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom'

import { Kwitter, Kwitter__factory } from '../typechain-types'
import Account from './components/Account'
import Feed from './components/Feed'
import Home from './components/Home'
import LoaderAnimation from './components/LoaderAnimation'
import NotFound from './components/NotFound'
import useWindowWidth from './components/useWindowWidth'
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX } from './constants'
import kwitterJson from './Kwitter.json'
import { getHashprint, reduceAddress } from './utils'

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

  const [hashprint, setHashprint] = useState<string>()

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

  const handleConnect = async () => {
    requestSepolia()
    try {
      // Request accounts
      await provider?.send('eth_requestAccounts', [])
      await getAccount()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const load = async () => {
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
    }
    load()
  }, [getAccount, provider, requestSepolia])

  useEffect(() => {
    if (account) getHashprint(account, 48).then(setHashprint)
  }, [account])

  useEffect(() => {
    contract.owner().then(setOwner)
  }, [contract])

  return (
    <Router>
      <nav className='fixed z-50 flex h-14 w-full items-center justify-between bg-secondary px-4 shadow shadow-white/10 sm:h-16 sm:px-8'>
        <Link to='/' className='flex items-center gap-2 text-white/90'>
          <img
            className='h-12 w-12'
            src='/kwitter-icon.png'
            alt='Kwitter Logo'
          />
          <h1 className='hidden text-3xl font-semibold md:block'>Kwitter</h1>
        </Link>

        {account ? (
          <div className='flex flex-row-reverse items-center gap-3 text-sm lg:text-base'>
            <Link className='peer' to={'/' + account}>
              <img
                className={
                  'duration-150 p-1 ease-in-out h-10 lg:h-12 border-2 border-primary/80 ' +
                  'shadow-none hover:shadow-primary hover:shadow-[0_0_10px_0px]'
                }
                src={hashprint}
              />
            </Link>
            <span className='font-semibold text-white/50 duration-150 ease-in-out peer-hover:text-primary/80'>
              {isMobile ? reduceAddress(account) : account}
            </span>
          </div>
        ) : (
          <button
            onClick={
              hasMetaMask
                ? handleConnect
                : () =>
                    window.open(
                      'https://ethereum.org/en/wallets/find-wallet',
                      'Ethereum Wallets',
                      'noopener noreferrer'
                    )
            }
            className={
              'flex items-center gap-1 text-primary text-lg font-semibold border border-primary rounded-lg px-4 py-1 ' +
              'duration-150 ease-in shadow-[0_0_10px_-3px] hover:shadow-primary ' +
              'hover:shadow-[0_0_20px_-3px] hover:bg-primary hover:text-secondary'
            }
          >
            {hasMetaMask ? 'Connect' : 'Install'}
          </button>
        )}
      </nav>

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
