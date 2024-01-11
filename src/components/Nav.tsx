import classNames from 'classnames'
import { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import useWindowWidth from '../hooks/useWindowWidth'
import { getHashprint, reduceAddress } from '../utils'

interface Props {
  account: string | undefined
  hasMetaMask: boolean
  onConnect: () => Promise<void>
}

const Nav: FC<Props> = ({ account, hasMetaMask, onConnect }) => {
  const [hashprint, setHashprint] = useState<string>()

  const isMobile = useWindowWidth() < 640

  useEffect(() => {
    if (account) getHashprint(account, 48).then(setHashprint)
  }, [account])

  const handleClick = () => {
    if (hasMetaMask) {
      onConnect()
      return
    }
    window.open(
      'https://ethereum.org/en/wallets/find-wallet',
      'Ethereum Wallets',
      'noopener noreferrer'
    )
  }

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

      {account ? (
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
          <span className='font-semibold text-white/50 duration-150 ease-in-out peer-hover:text-primary/80'>
            {isMobile ? reduceAddress(account) : account}
          </span>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className={classNames(
            'flex items-center gap-1 border border-primary text-lg font-semibold text-primary',
            'rounded-lg px-4 py-1 shadow-[0_0_10px_-3px] duration-150 ease-in hover:shadow-primary',
            'hover:bg-primary hover:text-secondary hover:shadow-[0_0_20px_-3px]'
          )}
        >
          {hasMetaMask ? 'Connect' : 'Install'}
        </button>
      )}
    </nav>
  )
}

export default Nav
