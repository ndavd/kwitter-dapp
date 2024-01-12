import classNames from 'classnames'
import { FC } from 'react'

import { Wallet } from '../types'

interface Props {
  hasPhantomWallet: boolean
  hasMetaMaskWallet: boolean
  onWalletSelect: (wallet: Wallet) => void
  onClose: () => void
}

const WalletsModal: FC<Props> = ({
  hasPhantomWallet,
  hasMetaMaskWallet,
  onWalletSelect,
  onClose
}) => {
  const renderButton = (wallet: Wallet, disabled: boolean) => (
    <button
      disabled={disabled}
      className={classNames(
        'w-full rounded-lg border border-primary p-2 text-center font-mono text-primary',
        'duration-75 hover:bg-primary hover:text-secondary'
      )}
      onClick={() => onWalletSelect(wallet)}
    >
      {wallet}
    </button>
  )
  return (
    <>
      <div
        onClick={onClose}
        className='absolute inset-0 flex h-screen w-screen items-center justify-center bg-bg/80'
      />
      <div
        className={classNames(
          'fixed inset-0 m-auto flex h-fit w-full max-w-md flex-col',
          'gap-4 rounded-lg bg-secondary p-5 py-8'
        )}
      >
        {renderButton(Wallet.PHANTOM, !hasPhantomWallet)}
        {renderButton(Wallet.METAMASK, !hasMetaMaskWallet)}
      </div>
    </>
  )
}

export default WalletsModal
