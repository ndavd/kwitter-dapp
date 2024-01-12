import { useCallback } from 'react'

import { Kwitter } from '../../typechain-types'
import useWindowWidth from '../hooks/useWindowWidth'
import { KweetType } from '../types'
import Kweet from './Kweet'

interface Props {
  list: KweetType[]
  account: string
  contract: Kwitter
  owner: string | undefined
  showAuthor?: boolean
}

const Kweets = ({
  list,
  contract,
  account,
  owner,
  showAuthor = true
}: Props) => {
  const isSmall = useWindowWidth() < 768

  const handleVote = useCallback(
    async (id: number) => {
      const value = await contract.votePrice()
      await contract.vote(id, { value })
    },
    [contract]
  )

  return (
    <ul className='mb-4'>
      {list.map((kweet, i) => (
        <Kweet
          key={i}
          kweet={kweet}
          owner={owner}
          account={account}
          showAuthor={showAuthor}
          isSmall={isSmall}
          isFirst={i == 0}
          isLast={i == list.length - 1}
          onVote={handleVote}
        />
      ))}
    </ul>
  )
}

export default Kweets
