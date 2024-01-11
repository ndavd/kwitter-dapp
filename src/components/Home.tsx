import classNames from 'classnames'
import { ethers } from 'ethers'
import { FC, useEffect, useState } from 'react'

import { Kwitter } from '../../typechain-types'
import Footer from './Footer'

interface Props {
  hasMetaMask: boolean
  contract: Kwitter
  owner: string | undefined
}

const Home: FC<Props> = ({
  hasMetaMask,
  contract,
  owner = ethers.ZeroAddress
}) => {
  const [totalKweets, setTotalKweets] = useState<number>(0)
  const [contractAddr, setContractAddr] = useState<string>(ethers.ZeroAddress)

  useEffect(() => {
    if (!contract) return
    contract.totalKweets().then((a) => setTotalKweets(Number(a)))
    contract.getAddress().then(setContractAddr)
    contract.on(contract.getEvent('NewKweet'), () =>
      setTotalKweets((i) => i + 1)
    )
  }, [contract])

  const renderTitle = () => (
    <section
      className={classNames(
        'flex w-full flex-col-reverse items-center justify-evenly',
        'rounded-[3rem] bg-secondary py-5 sm:flex-row lg:rounded-[5rem] lg:py-2'
      )}
    >
      <div className='flex h-4/5 flex-col justify-center gap-3 px-4 sm:w-1/2 sm:px-0'>
        <h1 className='text-center text-7xl font-bold text-white lg:text-9xl'>
          Kwitter
        </h1>
        <p className='text-center text-lg font-semibold italic text-white lg:text-xl'>
          A minimalistic and{' '}
          <span className='text-primary'>decentralized social platform</span>{' '}
          built on top of the{' '}
          <a
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
            href='https://sepolia.dev/'
          >
            <span className='line-through'>Kovan</span> Sepolia Ethereum Test
            Network
          </a>
          .
        </p>
      </div>
      <img
        className='w-4/5 sm:w-60 lg:w-96'
        src='/kwitter-logo.png'
        alt='Kwitter Logo'
      />
    </section>
  )

  const renderStats = () => (
    <div className='my-14 text-center font-semibold italic sm:text-lg'>
      <span className='font-mono text-5xl not-italic sm:text-[5rem]'>
        {totalKweets}
      </span>
      <br /> kweets so far
    </div>
  )
  const renderAction = () => (
    <div className='my-14 rounded-xl border-4 border-secondary bg-primary/60 p-4 text-center text-lg font-semibold lg:mx-16'>
      Please install a browser wallet.
    </div>
  )

  const renderInfo = () => (
    <section className='my-14 text-secondary/90 lg:px-16'>
      <h1 className='text-4xl font-semibold lg:text-5xl'>How it works</h1>
      <p className='mt-4 lg:text-lg'>
        Share small pieces of text (
        <span className='font-semibold italic'>kweets</span>) with everyone.
        Vote the kweets you like and the most voted will appear at the top of
        the feed. All data is stored exclusively on the Ethereum blockchain. No
        ads, no preferred content, it&apos;s entirely managed by the users.
        Connect your{' '}
        <a
          target='_blank'
          rel='noopener noreferrer'
          className='underline'
          href='https://ethereum.org/en/wallets/find-wallet'
        >
          browser wallet
        </a>{' '}
        such as MetaMask to get started.{' '}
      </p>
      <h1 className='mt-8 text-4xl font-semibold lg:text-5xl'>The goal</h1>
      <p className='mt-4 lg:text-lg'>
        Kwitter was not built to be a scalable social network but{' '}
        <span className='font-semibold'>
          to simply demonstrate how blockchain technology can be useful even in
          the social media domain.
        </span>{' '}
        It&apos;s therefore deployed on a testnet, which provides similar
        functionality as the main network while being free to use.
      </p>
      <p className='mt-4 lg:text-lg'>
        Everything is transparent, all data is public for everyone and there is
        no censoring whatsoever (of course in a real decentralized social
        network public protocols should be implemented in order to prevent bad
        content).
      </p>
      <p className='mt-4 text-center text-sm font-semibold italic text-secondary/90 sm:text-base lg:text-lg'>
        Kweet about your day, kweet about your thoughts, kweet about your dreams
        or about anything you want. <br className='hidden lg:block' />
        Be respectful and have fun :]
      </p>
    </section>
  )

  const renderAddresses = () => (
    <section className='mx-auto my-14 max-w-fit rounded-2xl bg-secondary px-6 py-4 text-center font-bold sm:text-lg'>
      <p className='text-white'>Kwitter Contract Address</p>
      <div className='truncate rounded bg-white px-2 py-1 font-mono text-sm sm:text-base'>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={'https://sepolia.etherscan.io/address/' + contractAddr}
          className='hover:underline'
        >
          {contractAddr}
        </a>
      </div>
      <p className='mt-4 text-white'>Owner Address</p>
      <div className='truncate rounded bg-white px-2 py-1 font-mono text-sm sm:text-base'>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={'https://sepolia.etherscan.io/address/' + owner}
          className='hover:underline'
        >
          {owner}
        </a>
      </div>
    </section>
  )

  return (
    <>
      <main className='container mx-auto min-h-screen px-4 py-20 text-secondary sm:pt-28 lg:max-w-5xl lg:px-0'>
        {renderTitle()}
        {hasMetaMask ? renderStats() : renderAction()}
        {renderInfo()}
        {hasMetaMask && renderAddresses()}
      </main>
      <Footer />
    </>
  )
}

export default Home
