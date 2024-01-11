import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Kwitter } from '../../typechain-types'
import { Kweet, reduceAddress } from '../utils'
import useWindowWidth from './useWindowWidth'

interface Props {
  list: Kweet[]
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

  const voteRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [price, setPrice] = useState<string>()

  useEffect(() => {
    contract.votePrice().then((price) => setPrice(price.toString()))
  }, [contract])

  const submitVote = async (id: number, index: number) => {
    try {
      await contract.vote(id, { value: price })
      // Update the button styling and increment the vote count
      voteRefs.current[index]!.disabled = true
      voteRefs.current[index]!.childNodes[0].nodeValue = voteRefs.current[
        index
      ]!.childNodes[0].nodeValue!.replace(/^(\d+) (vote.*)/, (_, n) => {
        const count = +n + 1
        const str = count === 1 ? 'vote' : 'votes'
        return count + ' ' + str
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <ul className='mb-4'>
      {list.map((k: Kweet, i: number) => {
        const date = new Date(k.timestamp * 1000).toLocaleString()
        const vote = k.voteCount + ' ' + (k.voteCount != 1 ? 'votes' : 'vote')
        const isOwner = k.author == owner
        const isAuthor = k.author == account

        return (
          <li
            key={i}
            className={`group relative min-h-[6rem] border-2
                border-secondary-light p-2 pb-10 font-semibold text-secondary/75 sm:hover:bg-secondary-transparent${
                  showAuthor ? ' pl-8' : ''
                }
                ${i === 0 ? 'rounded-t-md sm:rounded-t-xl' : ''}
                ${
                  i !== list.length - 1
                    ? 'border-b-0'
                    : 'rounded-b-md sm:rounded-b-xl'
                }`}
          >
            {showAuthor && (
              <>
                <Link to={'/' + k.author}>
                  <img
                    src={k.hashprint}
                    className={`absolute -left-3 -top-3 h-10 w-10 border-2 bg-white p-1 sm:-left-6 sm:h-12 sm:w-12
                      ${!isOwner ? 'border-primary-dark' : 'border-yellow-500'}
                    `}
                  />
                </Link>
                <div
                  className={`absolute -top-3 rounded bg-white px-1 text-xs sm:text-sm
                    sm:group-hover:bg-secondary-transparent
                    ${
                      !isOwner ? 'text-primary-dark/70' : 'text-yellow-500/80'
                    }`}
                >
                  {isSmall ? reduceAddress(k.author) : k.author}
                </div>
              </>
            )}

            <div className='translate-x-1 break-words text-base sm:text-lg'>
              {k.content}
            </div>

            <div className='absolute bottom-0 right-0 z-20 text-xs text-secondary/50'>
              {date}
              <button
                ref={(e) => voteRefs.current.push(e)}
                className={`ml-2 min-w-[10ch] rounded-tl border-l-2 border-t-2
                    border-primary-dark font-mono text-base font-semibold italic text-primary-dark
                    duration-150 ease-in-out hover:bg-primary-dark/20 disabled:text-white
                    sm:rounded-tl-lg sm:text-lg
                    ${
                      !isAuthor || k.hasVoted
                        ? 'disabled:bg-primary-dark'
                        : 'disabled:border-transparent disabled:bg-secondary-light'
                    }
                    ${
                      i !== list.length - 1
                        ? 'border-b-0'
                        : 'rounded-br sm:rounded-br-lg'
                    }
                  `}
                onClick={() => submitVote(k.id, i)}
                disabled={isAuthor || k.hasVoted}
              >
                {vote}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default Kweets
