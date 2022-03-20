import { useState, useEffect } from 'react';
import Footer from './Footer';

interface Props {
  hasMetaMask: boolean;
  contract:    any;
  owner:       string;
}

const Home = ({ hasMetaMask, contract, owner }: Props) => {
  const [ totalKweets, setTotalKweets ] = useState<number>(0);
  const [ contractAddr, setContractAddr ] = useState<string>("0x0");

  useEffect(() => {
    const load = async () => {
      if (contract !== undefined) {
        const tot = await contract.methods.totalKweets().call();
        setTotalKweets(+tot);

        setContractAddr(contract.options.address);

        contract.events.NewKweet(() => setTotalKweets(i => i+1));
      }
    }
    load();
  }, [contract]);

  return (<>
    <main className="container text-secondary lg:max-w-5xl px-4 lg:px-0 mx-auto min-h-screen pb-20 pt-20 sm:pt-28">

      <section className="flex flex-col-reverse sm:flex-row items-center justify-evenly rounded-[3rem] lg:rounded-[5rem] bg-secondary w-full py-5 lg:py-2">
        <div className="px-4 sm:px-0 sm:w-1/2 h-4/5 flex flex-col justify-center gap-3">
          <h1 className="text-center text-7xl lg:text-9xl font-bold text-white">
            Kwitter
          </h1>
          <p className="text-white text-lg lg:text-xl text-center font-semibold italic">
            A minimalistic and <span className="text-primary">decentralized social platform</span> built on top of
            the <a target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" href="https://kovan-testnet.github.io/website/">Kovan Ethereum Test Network</a>.
          </p>
        </div>
        <img className="w-4/5 sm:w-60 lg:w-96" src="/kwitter-logo.png" alt="Kwitter Logo"/>
      </section>

      {
        hasMetaMask?
        <div className="font-semibold italic text-center my-14 sm:text-lg">
          <span className="text-5xl sm:text-[5rem] font-mono not-italic">{totalKweets}</span><br/> kweets so far
        </div>:
        <div className="p-4 text-lg font-semibold text-center my-14 lg:mx-16 rounded-xl bg-primary/60 border-4 border-secondary">
          Please install MetaMask.
        </div>
      }

      <section className="my-14 text-secondary/90 lg:px-16">
        <h1 className="text-4xl lg:text-5xl font-semibold">How it works</h1>
        <p className="mt-4 lg:text-lg">
          Share small pieces of text (<span className="italic font-semibold">kweets</span>) with everyone.
          Vote the kweets you like and the most voted will appear at the top of
          the feed. All data is stored exclusively on the Ethereum blockchain. No ads, no
          preferred content, it&apos;s entirely managed by the users.
          Connect your <a target="_blank" rel="noopener noreferrer"
          className="underline" href="https://metamask.io/">
          MetaMask wallet</a> to get started. </p>
        <h1 className="mt-8 text-4xl lg:text-5xl font-semibold">The goal</h1>
        <p className="mt-4 lg:text-lg">
          Kwitter was not built to be a scalable social network but <span
          className="font-semibold">to simply demonstrate how blockchain
          technology can be useful even in the social media domain.</span> It&apos;s
          therefore deployed on a testnet, which provides similar functionality
          as the main network while being free to use.</p>
        <p className="mt-4 lg:text-lg">Everything is transparent, all data is
          public for everyone and there is no censoring whatsoever (of course in a
          real decentralized social network public protocols should be implemented
          in order to prevent bad content).</p>
        <p className="italic mt-4 text-secondary/90 font-semibold text-center text-sm sm:text-base lg:text-lg">
          Kweet about your day, kweet about your thoughts, kweet about your
          dreams or about anything you want. <br className="hidden lg:block"/>
          Be respectful and have fun :]
        </p>
      </section>

      {
        hasMetaMask &&
        <section className="bg-secondary rounded-2xl mx-auto my-14 font-bold px-6 py-4 max-w-fit sm:text-lg text-center">
          <p className="text-white">Kwitter Contract Address</p>
          <div className="bg-white truncate rounded px-2 py-1 text-sm sm:text-base font-mono">
            <a
              target="_blank" rel="noopener noreferrer"
              href={"https://kovan.etherscan.io/address/" + contractAddr}
              className="hover:underline"
            >
              {contractAddr}
            </a>
          </div>
          <p className="mt-4 text-white">Owner Address</p>
          <div className="bg-white truncate rounded px-2 py-1 text-sm sm:text-base font-mono">
            <a
              target="_blank" rel="noopener noreferrer"
              href={"https://kovan.etherscan.io/address/" + owner || "0x0"}
              className="hover:underline"
            >
              {owner || "0x0"}
            </a>
          </div>
        </section>
      }

    </main>

    <Footer/>
  </>);
}

export default Home;
