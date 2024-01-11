import classNames from 'classnames'
import { FC, useCallback, useEffect, useState } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { useParams } from 'react-router-dom'

import { Kwitter } from '../../typechain-types'
import useWindowWidth from '../hooks/useWindowWidth'
import { fetchOrderedKweets, getHashprint, reduceAddress } from '../utils'
import { KweetType } from './Kweet'
import Kweets from './Kweets'
import LoaderAnimation from './LoaderAnimation'
import NotFound from './NotFound'
import SortingButton, { SortBy } from './SortingButton'

interface Props {
  contract: Kwitter
  account: string
  owner: string | undefined
}

const Account: FC<Props> = ({ contract, account, owner }) => {
  const acc = useParams().address as string

  const [hashprint, setHashprint] = useState<string>()

  const isSmall = useWindowWidth() < 768

  const [wasFound, setWasFound] = useState<boolean>(true)

  const [sortBy, setSortBy] = useState<SortBy>('newest')

  const [kweetList, setKweetList] = useState<KweetType[]>([])

  const [firstKweetDate, setFirstKweetDate] = useState<string>()

  const getKweets = useCallback(
    async (ids: bigint[]) => {
      setKweetList([])
      const kweets = await fetchOrderedKweets(contract, account, sortBy, ids)

      setKweetList(kweets)

      if (!firstKweetDate) {
        setFirstKweetDate(
          new Date(kweets[0].timestamp * 1000).toLocaleDateString()
        )
      }
    },
    [account, contract, firstKweetDate, sortBy]
  )

  const getIds = useCallback(async () => {
    let kweetIds: bigint[] = []
    try {
      kweetIds = await contract.getAccountKweets(acc)
      if (kweetIds.length == 0) setWasFound(false)
    } catch (err) {
      setWasFound(false)
    }
    return kweetIds
  }, [acc, contract])

  useEffect(() => {
    getIds().then(getKweets)
  }, [getIds, getKweets])

  useEffect(() => {
    getHashprint(acc, 140).then(setHashprint)
  }, [acc])

  if (!wasFound) {
    return <NotFound />
  }

  const renderThisIsYou = () => (
    <div
      className={
        'mb-2 self-end rounded-md bg-primary px-2 font-semibold italic sm:rounded-lg'
      }
    >
      this is you
    </div>
  )

  const renderThisIsOwner = () => (
    <div
      className={
        'mb-2 rounded-md bg-yellow-500 px-2 text-center font-semibold italic text-white sm:rounded-lg'
      }
    >
      This account belongs to the Kwitter&apos;s founder
    </div>
  )

  const renderUserData = () => (
    <section
      className={classNames(
        'rounded-r-md border-2 border-secondary-light sm:rounded-r-2xl sm:border-4',
        'mb-4 flex w-full text-secondary/70'
      )}
    >
      <img
        className={classNames(
          'h-24 w-24 bg-secondary-light/50 outline outline-2',
          'outline-secondary-light sm:h-32 sm:w-32 sm:outline-4'
        )}
        src={hashprint}
      />
      <div className='flex w-full flex-col justify-between px-2 text-base font-semibold sm:px-4 sm:text-lg'>
        <div>
          <div>{isSmall ? reduceAddress(acc) : acc}</div>
          <button
            onClick={() => navigator.clipboard.writeText(acc)}
            className='hidden font-semibold italic text-secondary/40 sm:inline'
          >
            copy address
          </button>
          <a
            target='_blank'
            rel='noopener noreferrer'
            className='block font-semibold italic text-secondary/40 hover:underline sm:inline sm:pl-4'
            href={'https://sepolia.etherscan.io/address/' + acc}
          >
            view on Etherscan
          </a>
        </div>
        <div className='flex justify-between text-base'>
          <div>
            <span className='text-secondary/40'>kweets: </span>
            {kweetList.length}
          </div>
          <div className='hidden text-right italic text-secondary/40 sm:block sm:text-left'>
            first kweeted on{' '}
            <span className='text-secondary/40'>{firstKweetDate}</span>
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{acc} - Kwitter</title>
        </Helmet>
      </HelmetProvider>

      <main
        className={classNames(
          'flex flex-col px-4 text-secondary md:max-w-3xl',
          'mx-auto min-h-screen pt-[4.5rem] sm:px-8 sm:pt-28 md:px-10 lg:px-0'
        )}
      >
        {acc == account && renderThisIsYou()}
        {acc == owner && renderThisIsOwner()}
        {renderUserData()}

        <SortingButton sortBy={sortBy} setSortBy={setSortBy} />
        {kweetList.length > 0 ? (
          <Kweets
            list={kweetList}
            contract={contract}
            account={account}
            owner={owner}
            showAuthor={false}
          />
        ) : (
          <LoaderAnimation py='1.5em' />
        )}
      </main>
    </>
  )
}

export default Account
