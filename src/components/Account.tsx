import classNames from 'classnames'
import { ethers } from 'ethers'
import { FC, useCallback, useEffect, useState } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'

import { Kwitter } from '../../typechain-types'
import useWindowWidth from '../hooks/useWindowWidth'
import { KweetType, SortBy } from '../types'
import { fetchOrderedKweets, getHashprint, reduceAddress } from '../utils'
import Kweets from './Kweets'
import LoaderAnimation from './LoaderAnimation'
import NotFound from './NotFound'
import SortingButton from './SortingButton'
import Status from './Status'

interface Props {
  addr: string
  contract: Kwitter
  account: string | undefined
  owner: string | undefined
}

const Account: FC<Props> = ({ contract, account, owner, addr }) => {
  const [wasFound, setWasFound] = useState<boolean>(true)
  const [sortBy, setSortBy] = useState(SortBy.NEWEST)
  const [kweetList, setKweetList] = useState<KweetType[]>([])
  const [firstKweetDate, setFirstKweetDate] = useState<string>()
  const [hashprint, setHashprint] = useState<string>()

  const isAccount = ethers.isAddress(addr)

  const isSmall = useWindowWidth() < 768

  const getKweets = useCallback(
    async (ids: bigint[]) => {
      if (ids.length == 0 || !account) {
        setKweetList([])
        setFirstKweetDate(undefined)
        return
      }

      const kweets = await fetchOrderedKweets(contract, account, sortBy, ids)

      setKweetList(kweets)

      if (!firstKweetDate) {
        kweets.sort((a, b) => a.timestamp - b.timestamp)
        setFirstKweetDate(
          new Date(kweets[0].timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          })
        )
      }
    },
    [account, contract, firstKweetDate, sortBy]
  )

  const getIds = useCallback(async () => {
    let kweetIds: bigint[] = []
    try {
      kweetIds = await contract.getAccountKweets(addr)
      if (kweetIds.length == 0) setWasFound(false)
    } catch (e) {
      console.error(e)
    }
    return kweetIds
  }, [addr, contract])

  useEffect(() => {
    if (wasFound && account) getIds().then(getKweets)
  }, [getIds, getKweets, wasFound, account])

  useEffect(() => {
    getHashprint(addr, 140).then(setHashprint)
  }, [addr])

  if (!isAccount) {
    return <NotFound />
  }

  const renderThisIsYou = () => (
    <div
      className={
        'mb-2 self-end rounded-md bg-primary px-2 font-semibold italic text-secondary sm:rounded-lg'
      }
    >
      this is you
    </div>
  )

  const renderThisIsOwner = () => (
    <div
      className={
        'mb-2 rounded-md bg-yellow-500 px-2 text-center font-semibold italic text-secondary sm:rounded-lg'
      }
    >
      This account belongs to the Kwitter&apos;s founder
    </div>
  )

  const renderUserData = () => (
    <section
      className={classNames(
        'rounded-r-md border-2 border-secondary sm:rounded-r-2xl sm:border-4',
        'mb-4 flex w-full text-secondary-light'
      )}
    >
      <img
        className={classNames(
          'h-24 w-24 bg-secondary outline outline-2',
          'outline-secondary-light/40 sm:h-32 sm:w-32 sm:outline-4'
        )}
        src={hashprint}
      />
      <div className='flex w-full flex-col justify-between px-2 text-base font-semibold sm:px-4 sm:text-lg'>
        <div>
          <div>{isSmall ? reduceAddress(addr) : addr}</div>
          <button
            onClick={() => navigator.clipboard.writeText(addr)}
            className='hidden font-semibold italic text-secondary-light/40 sm:inline'
          >
            copy address
          </button>
          <a
            target='_blank'
            rel='noopener noreferrer'
            className='block font-semibold italic text-secondary-light/40 hover:underline sm:inline sm:pl-4'
            href={'https://sepolia.etherscan.io/address/' + addr}
          >
            view on Etherscan
          </a>
        </div>
        <div className='flex justify-between text-base'>
          {account && wasFound && (
            <div>
              <span className='text-secondary-light/40'>Kweets: </span>
              {kweetList.length}
            </div>
          )}
          {firstKweetDate && (
            <div className='hidden text-right italic text-secondary-light/40 sm:block sm:text-left'>
              First kweeted on <span>{firstKweetDate}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )

  const renderUserFeed = () =>
    account ? (
      <>
        <SortingButton sortBy={sortBy} setSortBy={setSortBy} />
        {kweetList.length > 0 ? (
          <Kweets
            key={account}
            list={kweetList}
            contract={contract}
            account={account}
            owner={owner}
            showAuthor={false}
          />
        ) : (
          <LoaderAnimation py='1.5em' />
        )}
      </>
    ) : null

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{addr} - Kwitter</title>
        </Helmet>
      </HelmetProvider>

      <main
        className={classNames(
          'flex flex-col px-4 text-secondary-light md:max-w-3xl',
          'mx-auto min-h-screen pt-[4.5rem] sm:px-8 sm:pt-28 md:px-10 lg:px-0'
        )}
      >
        {addr == account && renderThisIsYou()}
        {addr == owner && renderThisIsOwner()}
        {renderUserData()}

        {!account ? (
          <Status msg='Connect to see kweets' />
        ) : !wasFound ? (
          <Status msg='The user has no kweets' />
        ) : (
          renderUserFeed()
        )}
      </main>
    </>
  )
}

export default Account
