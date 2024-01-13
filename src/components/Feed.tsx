import classNames from 'classnames'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'

import { Kwitter } from '../../typechain-types'
import useWindowWidth from '../hooks/useWindowWidth'
import { KweetType, SortBy } from '../types'
import { getHashprint } from '../utils'
import { fetchOrderedKweets } from '../utils'
import Kweets from './Kweets'
import LoaderAnimation from './LoaderAnimation'
import SortingButton from './SortingButton'

interface Props {
  contract: Kwitter
  account: string
  owner: string | undefined
}

const Feed: FC<Props> = ({ account, contract, owner }) => {
  const isMobile = useWindowWidth() < 640

  const [hashprint, setHashprint] = useState<string>('')

  const [content, setContent] = useState<string>('')
  const [byteCount, setByteCount] = useState<number>(256)

  const kweetButtonRef = useRef<HTMLButtonElement>(null)

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.NEWEST)

  const [kweetList, setKweetList] = useState<KweetType[] | undefined>()

  const [kweetPrice, setKweetPrice] = useState<string>('')

  const adaptInputHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.height = ''
    e.currentTarget.style.height =
      Math.min(e.currentTarget.scrollHeight + 2, isMobile ? 160 : 180) + 'px'
  }

  const getKweets = useCallback(async () => {
    setKweetList(await fetchOrderedKweets(contract, account, sortBy))
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
    await getKweets()
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
    getKweets()
  }, [getKweets])

  const renderInput = () => (
    <section className='relative mb-6 flex flex-col'>
      <textarea
        placeholder='Share some knowledge'
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
        onInput={adaptInputHeight}
        className={classNames(
          'peer h-24 w-full resize-none border-2 text-base sm:text-lg',
          'border-b-0 border-secondary-light bg-secondary text-secondary-light focus:outline-none',
          'rounded-t-md p-1 px-2 focus:border-primary-dark sm:rounded-t-xl sm:p-2 sm:pl-12'
        )}
      />
      {!isMobile && (
        <img
          className={classNames(
            'absolute -left-2 -top-2 w-8 border-2 bg-secondary p-1 sm:-left-6 sm:-top-6 sm:w-16',
            'border-secondary-light peer-focus:border-primary-dark'
          )}
          src={hashprint}
        />
      )}
      <div
        className={classNames(
          'absolute bottom-4 right-0 z-10 px-2 text-sm font-semibold',
          byteCount >= 0 ? 'text-white' : 'text-red-500'
        )}
      >
        {byteCount}
      </div>
      <button
        ref={kweetButtonRef}
        onClick={submitKweet}
        disabled={byteCount < 0 || byteCount == 256}
        className={classNames(
          'w-full border-2 border-t-0 border-secondary-light italic',
          'rounded-b-md font-bold peer-focus:border-primary-dark sm:rounded-b-xl',
          'bg-primary-dark py-1 text-lg text-white duration-150 hover:hue-rotate-[10deg]',
          'hover:tracking-[1em] disabled:bg-secondary-light/20 disabled:tracking-normal'
        )}
      >
        kweet
      </button>
    </section>
  )

  return (
    <>
      <Helmet>
        <title>Feed - Kwitter</title>
      </Helmet>

      <main
        className={classNames(
          'flex flex-col px-4 text-secondary md:max-w-3xl',
          'mx-auto min-h-screen pt-[4.5rem] sm:px-8 sm:pt-28 md:px-10 lg:px-0'
        )}
      >
        {renderInput()}
        <SortingButton sortBy={sortBy} setSortBy={setSortBy} />
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
