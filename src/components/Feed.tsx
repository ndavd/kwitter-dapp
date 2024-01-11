import { useCallback, useEffect, useRef, useState } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'

import { Kwitter } from '../../typechain-types'
import { getHashprint } from '../utils'
import { fetchOrderedKweets, Kweet, SortBy } from '../utils'
import Kweets from './Kweets'
import LoaderAnimation from './LoaderAnimation'

interface Props {
  contract: Kwitter
  account: string
  owner: string | undefined
  isMobile: boolean
}

const Feed = ({ isMobile, account, contract, owner }: Props) => {
  const [hashprint, setHashprint] = useState<string>('')

  const [content, setContent] = useState<string>('')
  const [byteCount, setByteCount] = useState<number>(256)

  const kweetButtonRef = useRef<HTMLButtonElement>(null)

  const [sortBy, setSortBy] = useState<SortBy>('newest')

  const [kweetList, setKweetList] = useState<Kweet[] | undefined>()

  const [kweetPrice, setKweetPrice] = useState<string>('')

  const adaptInputHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.height = ''
    e.currentTarget.style.height =
      Math.min(e.currentTarget.scrollHeight + 2, isMobile ? 160 : 180) + 'px'
  }

  const getKweets = useCallback(async () => {
    const kweets = await fetchOrderedKweets(contract, account, sortBy)

    setKweetList(kweets)
    setContent('')
  }, [account, contract, sortBy])

  const submitKweet = async () => {
    if (kweetButtonRef.current) {
      kweetButtonRef.current.disabled = true
    }
    try {
      await contract.kweet(content.trim(), { value: kweetPrice })
    } catch (err) {
      console.error(err)
    }
    if (kweetButtonRef.current) {
      kweetButtonRef.current.disabled = false
    }
    getKweets()
  }

  useEffect(() => {
    getHashprint(account, 64).then(setHashprint)
    contract.kweetPrice().then((price) => setKweetPrice(price.toString()))
  }, [account, contract])

  useEffect(() => {
    const length = new Blob([content]).size
    setByteCount(256 - length)
  }, [content])

  useEffect(() => {
    const load = async () => {
      // Reset kweet list
      setKweetList([])

      await getKweets()
    }
    load()
  }, [getKweets, sortBy])

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Feed - Kwitter</title>
        </Helmet>
      </HelmetProvider>

      <main
        className={
          'flex flex-col text-secondary md:max-w-3xl px-4 ' +
          'sm:px-8 md:px-10 lg:px-0 mx-auto min-h-screen pt-[4.5rem] sm:pt-28'
        }
      >
        <section className='relative mb-6 flex flex-col'>
          <textarea
            placeholder='Share some knowledge'
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            onInput={adaptInputHeight}
            className={
              'peer w-full resize-none text-base sm:text-lg h-24 border-2 ' +
              'border-secondary-light border-b-0 focus:outline-none ' +
              'focus:border-primary-dark p-1 sm:p-2 px-2 sm:pl-12 rounded-t-md sm:rounded-t-xl'
            }
          />
          {!isMobile && (
            <img
              className={
                'absolute w-8 sm:w-16 p-1 bg-white -top-2 -left-2 sm:-top-6 sm:-left-6 border-2 ' +
                'border-secondary-light peer-focus:border-primary-dark'
              }
              src={hashprint}
            />
          )}
          <div
            className={
              'absolute right-0 bottom-4 z-10 text-sm font-semibold px-2 ' +
              (byteCount >= 0 ? 'text-white' : 'text-red-500')
            }
          >
            {byteCount}
          </div>
          <button
            ref={kweetButtonRef}
            onClick={submitKweet}
            disabled={byteCount < 0 || byteCount == 256}
            className={
              'w-full italic border-2 border-t-0 border-secondary-light ' +
              'peer-focus:border-primary-dark font-bold rounded-b-md sm:rounded-b-xl ' +
              'text-lg py-1 text-white bg-primary-dark duration-150 hover:hue-rotate-[10deg] ' +
              'hover:tracking-[1em] disabled:tracking-normal disabled:bg-secondary-light'
            }
          >
            kweet
          </button>
        </section>

        <button
          className={
            'mb-2 self-end flex rounded-md sm:rounded-lg font-semibold ' +
            'border-2 border-primary-dark text-primary-dark'
          }
          onClick={() =>
            setSortBy((e) => (e === 'newest' ? 'most voted' : 'newest'))
          }
        >
          <span
            className={
              'text-center w-24 ' +
              (sortBy === 'newest' ? 'bg-primary-dark text-white' : '')
            }
          >
            newest
          </span>
          <span
            className={
              'text-center w-24 ' +
              (sortBy === 'most voted' ? 'bg-primary-dark text-white' : '')
            }
          >
            most voted
          </span>
        </button>

        {kweetList ? (
          <Kweets
            list={kweetList}
            contract={contract}
            account={account}
            owner={owner}
          />
        ) : (
          <LoaderAnimation py='1.5em' />
        )}
      </main>
    </>
  )
}

export default Feed
