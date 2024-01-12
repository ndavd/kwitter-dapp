import classNames from 'classnames'
import { BrowserProvider, ethers } from 'ethers'
import { FC, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import useWindowWidth from '../hooks/useWindowWidth'
import { Wallet } from '../types'
import { getHashprint, reduceAddress } from '../utils'
import WalletsModal from './WalletsModal'

interface Props {
  account: string | undefined
  provider: BrowserProvider | null
  isSepolia: boolean
  hasPhantomWallet: boolean
  hasMetaMaskWallet: boolean
  onWalletSelect: (wallet: Wallet) => void
}

const NO_BALANCE = '-.----'

const Nav: FC<Props> = ({
  account,
  provider,
  isSepolia,
  hasPhantomWallet,
  hasMetaMaskWallet,
  onWalletSelect
}) => {
  const [modal, setModal] = useState(false)
  const [hashprint, setHashprint] = useState<string>()
  const [balance, setBalance] = useState<string>(NO_BALANCE)

  const isMobile = useWindowWidth() < 640

  const fetchBalance = useCallback(async () => {
    if (!account || !provider) return
    try {
      setBalance(NO_BALANCE)
      const weiBalance = await provider.getBalance(account)
      setBalance(Number(ethers.formatEther(weiBalance)).toFixed(4))
    } catch (e) {
      console.error(e)
    }
  }, [provider, account])

  useEffect(() => {
    if (!account) return
    getHashprint(account, 48).then(setHashprint)
    fetchBalance()
  }, [account, provider, fetchBalance])

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
  }, [modal])

  const handleCloseModal = () => setModal(false)

  const handleWalletSelect = (wallet: Wallet) => {
    onWalletSelect(wallet)
    handleCloseModal()
  }

  const handleClick = () => {
    if (hasMetaMaskWallet || hasPhantomWallet) {
      return setModal(true)
    }
    window.open(
      'https://ethereum.org/en/wallets/find-wallet',
      'Ethereum Wallets',
      'noopener noreferrer'
    )
  }

  const renderInstallConnectButton = () => (
    <button
      onClick={handleClick}
      className={classNames(
        'flex items-center gap-1 border border-primary text-lg font-semibold text-primary',
        'rounded-lg px-4 py-1 shadow-[0_0_10px_-3px] duration-150 ease-in hover:shadow-primary',
        'hover:bg-primary hover:text-secondary hover:shadow-[0_0_20px_-3px]'
      )}
    >
      {hasMetaMaskWallet ? 'Connect' : 'Install'}
    </button>
  )

  const renderUserInfo = () =>
    account ? (
      <div className='flex flex-row-reverse items-center gap-3 text-sm lg:text-base'>
        <Link className='peer' to={'/' + account}>
          <img
            className={classNames(
              'h-10 border-2 border-primary/80 p-1 duration-150 ease-in-out lg:h-12',
              'shadow-none hover:shadow-[0_0_10px_0px] hover:shadow-primary'
            )}
            src={hashprint}
          />
        </Link>
        <div className='flex flex-col items-end gap-0'>
          <span className='font-semibold text-secondary-light duration-150 ease-in-out peer-hover:text-primary/80'>
            {isMobile ? reduceAddress(account) : account}
          </span>
          <span
            className={classNames(
              'w-full',
              isSepolia ? 'text-green-500' : 'text-red-500'
            )}
          >
            <div className='flex w-full justify-between gap-2'>
              {isSepolia ? (
                <button
                  onClick={fetchBalance}
                  className={classNames(
                    balance == '0.0000' ? 'text-red-200' : 'text-green-200'
                  )}
                >
                  {balance} ETH
                </button>
              ) : (
                <div />
              )}
              {isSepolia ? 'Sepolia' : 'Please switch to Sepolia Testnet'}
            </div>
          </span>
        </div>
      </div>
    ) : null

  return (
    <nav
      className={classNames(
        'fixed z-50 flex h-14 w-full items-center justify-between',
        'bg-secondary px-4 shadow shadow-white/10 sm:h-16 sm:px-8'
      )}
    >
      <Link to='/' className='flex items-center gap-2 text-white/90'>
        <img className='h-12 w-12' src='/kwitter-icon.png' alt='Kwitter Logo' />
        <h1 className='hidden text-3xl font-semibold md:block'>Kwitter</h1>
      </Link>

      {modal && (
        <WalletsModal
          hasPhantomWallet={hasPhantomWallet}
          hasMetaMaskWallet={hasMetaMaskWallet}
          onWalletSelect={handleWalletSelect}
          onClose={handleCloseModal}
        />
      )}

      {account ? renderUserInfo() : renderInstallConnectButton()}
    </nav>
  )
}

export default Nav
