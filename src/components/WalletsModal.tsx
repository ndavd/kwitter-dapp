import classNames from 'classnames'
import { FC } from 'react'

import { Wallet } from '../types'
import { getWalletImage } from '../utils'

interface Props {
  onWalletSelect: (wallet: Wallet) => void
  onClose: () => void
}

const WalletsModal: FC<Props> = ({ onWalletSelect, onClose }) => {
  const renderButton = (wallet: Wallet) => (
    <button
      className={classNames(
        'h-14 rounded-lg border border-primary p-2 font-mono text-primary',
        'flex flex-row items-center gap-4 font-bold duration-75 hover:bg-primary hover:text-secondary'
      )}
      onClick={() => onWalletSelect(wallet)}
    >
      <img className='w-9' src={getWalletImage(wallet)} alt={wallet} />
      <span>{wallet}</span>
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
          'fixed inset-0 m-auto flex h-fit w-full max-w-xs flex-col',
          'gap-4 rounded-lg bg-secondary p-5 py-8'
        )}
      >
        {renderButton(Wallet.PHANTOM)}
        {renderButton(Wallet.METAMASK)}
      </div>
    </>
  )
}

export default WalletsModal
