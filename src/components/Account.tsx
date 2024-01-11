import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Kwitter } from '../../typechain-types'
import {
  fetchOrderedKweets,
  getHashprint,
  Kweet,
  reduceAddress,
  SortBy
} from '../utils'
import Kweets from './Kweets'
import LoaderAnimation from './LoaderAnimation'
import NotFound from './NotFound'
import useWindowWidth from './useWindowWidth'
import { Helmet, HelmetProvider } from 'react-helmet-async'

interface Props {
  contract: Kwitter
  account: string
  owner: string | undefined
}

const Account = ({ contract, account, owner }: Props) => {
  const acc = useParams().address as string

  const [hashprint, setHashprint] = useState<string>('')

  const isSmall = useWindowWidth() < 768

  const [wasFound, setWasFound] = useState<boolean>(true)

  const [sortBy, setSortBy] = useState<SortBy>('newest')

  const [ids, setIds] = useState<number[]>([])
  const [kweetList, setKweetList] = useState<Kweet[]>([])

  const [firstKweetDate, setFirstKweetDate] = useState<string>('')

  const getKweets = async () => {
    const kweets = await fetchOrderedKweets(contract, account, sortBy, ids)

    setKweetList(kweets)

    if (firstKweetDate === '') {
      setFirstKweetDate(
        new Date(kweets[0].timestamp * 1000).toLocaleDateString()
      )
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const kweetIds = await contract.getAccountKweets(acc)

        if (kweetIds.length === 0) {
          setWasFound(false)
        }

        setIds(kweetIds.map(id => Number(id)))
      } catch (err) {
        setWasFound(false)
      }
    }
    load()
  }, [acc])

  useEffect(() => {
    if (ids.length === 0) return
    const load = async () => {
      const hashprint = await getHashprint(acc, 140)
      setHashprint(hashprint)

      // Reset kweet list
      setKweetList([])

      await getKweets()
    }
    load()
  }, [sortBy, ids])

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{acc} - Kwitter</title>
        </Helmet>
      </HelmetProvider>

      {wasFound ? (
        <main
          className={
            'flex flex-col text-secondary md:max-w-3xl px-4 ' +
            'sm:px-8 md:px-10 lg:px-0 mx-auto min-h-screen pt-[4.5rem] sm:pt-28'
          }
        >
          {acc === account && (
            <div
              className={
                'mb-2 self-end rounded-md bg-primary px-2 font-semibold italic sm:rounded-lg'
              }
            >
              this is you
            </div>
          )}

          {acc === owner && (
            <div
              className={
                'mb-2 rounded-md bg-yellow-500 px-2 text-center font-semibold italic text-white sm:rounded-lg'
              }
            >
              This account belongs to the Kwitter&apos;s founder
            </div>
          )}

          <section
            className={
              'border-2 sm:border-4 border-secondary-light rounded-r-md sm:rounded-r-2xl ' +
              'mb-4 w-full flex text-secondary/70'
            }
          >
            <img
              className='h-24 w-24 bg-secondary-light/50 outline outline-2 outline-secondary-light sm:h-32 sm:w-32 sm:outline-4'
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
      ) : (
        <NotFound />
      )}
    </>
  )
}

export default Account
