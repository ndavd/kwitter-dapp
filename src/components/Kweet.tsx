import classNames from 'classnames'
import { FC, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

import { reduceAddress } from '../utils'

export interface KweetType {
  id: number
  author: string
  hashprint: string
  content: string
  voteCount: number
  timestamp: number
  hasVoted: boolean
}

interface Props {
  kweet: KweetType
  owner: string | undefined
  account: string
  showAuthor: boolean
  isSmall: boolean
  isFirst: boolean
  isLast: boolean
  onVote: (id: number) => Promise<void>
}

const Kweet: FC<Props> = ({
  kweet,
  owner,
  account,
  showAuthor,
  isSmall,
  isFirst,
  isLast,
  onVote
}) => {
  const [hasVoted, setHasVoted] = useState(kweet.hasVoted)

  const justVoted = !kweet.hasVoted && hasVoted
  const vote = `${kweet.voteCount + (justVoted ? 1 : 0)} ${
    kweet.voteCount == 1 ? 'vote' : 'votes'
  }`
  const date = new Date(kweet.timestamp * 1000).toLocaleString()
  const isOwner = kweet.author == owner
  const isAuthor = kweet.author == account

  const handleClick = useCallback(async () => {
    try {
      await onVote(kweet.id)
      setHasVoted(true)
    } catch (e) {
      console.error(e)
    }
  }, [kweet.id, onVote])

  return (
    <li
      className={classNames(
        'group relative min-h-[6rem] border-2 border-secondary-light p-2 pb-10',
        'font-semibold text-secondary/75 sm:hover:bg-secondary-transparent',
        {
          'pl-8': showAuthor,
          'rounded-t-md sm:rounded-t-xl': isFirst,
          'border-b-0': !isLast,
          'rounded-b-md sm:rounded-b-xl': isLast
        }
      )}
    >
      {showAuthor && (
        <>
          <Link to={'/' + kweet.author}>
            <img
              src={kweet.hashprint}
              className={classNames(
                'absolute -left-3 -top-3 h-10 w-10 border-2 bg-white p-1 sm:-left-6 sm:h-12 sm:w-12',
                {
                  'border-yellow-500': isOwner,
                  'border-primary-dark': !isOwner
                }
              )}
            />
          </Link>
          <div
            className={classNames(
              'absolute -top-3 rounded bg-white px-1 text-xs sm:text-sm sm:group-hover:bg-secondary-transparent',
              {
                'text-yellow-500/80': isOwner,
                'text-primary-dark/70': !isOwner
              }
            )}
          >
            {isSmall ? reduceAddress(kweet.author) : kweet.author}
          </div>
        </>
      )}

      <div className='translate-x-1 break-words text-base sm:text-lg'>
        {kweet.content}
      </div>

      <div className='absolute bottom-0 right-0 z-20 text-xs text-secondary/50'>
        {date}
        <button
          className={classNames(
            'ml-2 min-w-[10ch] rounded-tl border-l-2 border-t-2',
            'border-primary-dark font-mono text-base font-semibold italic text-primary-dark',
            'duration-150 ease-in-out hover:bg-primary-dark/20 disabled:text-white sm:rounded-tl-lg sm:text-lg',
            !isAuthor || kweet.hasVoted
              ? 'disabled:bg-primary-dark'
              : 'disabled:border-transparent disabled:bg-secondary-light',
            { 'border-b-0': !isLast, 'rounded-br sm:rounded-br-lg': isLast }
          )}
          onClick={handleClick}
          disabled={isAuthor || hasVoted}
        >
          {vote}
        </button>
      </div>
    </li>
  )
}

export default Kweet
