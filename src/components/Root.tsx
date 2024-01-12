import { FC } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Kwitter } from '../../typechain-types'
import { ACCOUNT_URL_PARAM } from '../constants'
import Account from './Account'
import Feed from './Feed'
import Home from './Home'
import LoaderAnimation from './LoaderAnimation'

interface Props {
  account: string | undefined
  contract: Kwitter
  owner: string | undefined
  connected: boolean
  hasWallet: boolean
}

const Root: FC<Props> = ({
  account,
  contract,
  owner,
  connected,
  hasWallet
}) => {
  const [params] = useSearchParams()
  const addr = params.get(ACCOUNT_URL_PARAM)

  if (addr) {
    return (
      <Account
        addr={addr}
        account={account}
        contract={contract}
        owner={owner}
      />
    )
  }

  if (!account) {
    return <Home hasWallet={hasWallet} contract={contract} owner={owner} />
  }

  if (!connected) {
    return <LoaderAnimation py='5em' />
  }

  return <Feed account={account} contract={contract} owner={owner} />
}

export default Root
