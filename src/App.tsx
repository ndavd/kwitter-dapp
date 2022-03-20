import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Feed from './components/Feed';
import Account from './components/Account';
import Web3 from 'web3';
import useWindowWidth from './components/useWindowWidth';
import { default as Contract } from './build/Kwitter.json';
import { reduceAddress, getIdenticon } from './utils';
import LoaderAnimation from './components/LoaderAnimation';
import NotFound from './components/NotFound';

const App = () => {
  const [ hasMetaMask, setHasMetaMask ] = useState<boolean>(false);
  const [ account, setAccount ] = useState<string>("");
  const [ owner, setOwner] = useState<string>("");

  const [ contract, setContract ] = useState();

  const isMobile = useWindowWidth() < 640;

  const getAccount = async () => {
    const accounts = await (window as any).web3.eth.getAccounts();
    setAccount(accounts[0]);
  }

  const handleConnect = async () => {
    try {
      // Request change to Kovan network
      if (process.env.NODE_ENV === "production") {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2a" }]
        });
      }
      // Request accounts
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      getAccount();
    } catch (err: any) {
      if (err.code !== 4001) console.error(err);
    }
  }

  useEffect(() => {
    const load = async () => {
      const { ethereum } = window as any;

      if (ethereum && ethereum.isMetaMask) {
        (window as any).web3 = new Web3(ethereum);
        setHasMetaMask(true);

        if (process.env.NODE_ENV === "production") {
          const net = await (window as any).web3.eth.net.getNetworkType();
          if (net === "kovan") getAccount();
        } else {
          getAccount();
        }

        // Get contract
        const id = await (window as any).web3.eth.net.getId();
        const kwitter = new (window as any).web3.eth.Contract(Contract.abi, Contract.networks[id].address);
        setContract( kwitter );

        // Get owner
        setOwner(await kwitter.methods.owner().call());

        ethereum.on("accountsChanged", (_: string[]) => {
          window.location.reload();
        });

        if (process.env.NODE_ENV === "production") {
          ethereum.on('chainChanged', (chainId: string) => {
            if (chainId !== "0x2a") window.location.reload();
          });
        }
      }
    }
    load();
  }, []);

  return (
    <Router>

      <nav className="fixed z-50 w-full flex items-center justify-between h-14 sm:h-16 bg-secondary px-4 sm:px-8 shadow-white/10 shadow">

        <Link to="/" className="flex items-center text-white/90 gap-2">
          <img className="w-12 h-12" src="/kwitter-icon.png" alt="Kwitter Logo"/>
          <h1 className="hidden md:block font-semibold text-3xl">Kwitter</h1>
        </Link>

        {
          !account?

          <button
            onClick={ hasMetaMask?handleConnect:()=>window.open("https://metamask.io/download/", "MetaMask", "noopener noreferrer") }
            className={
              "flex items-center gap-1 text-primary text-lg font-semibold border border-primary rounded-lg px-4 py-1 " +
              "duration-150 ease-in shadow-[0_0_10px_-3px] hover:shadow-primary " +
              "hover:shadow-[0_0_20px_-3px] hover:bg-primary hover:text-secondary"
            }
          >
            <img className="h-6 w-6" src="/metamask.svg"/>
            {hasMetaMask?"Connect":"Install"}
          </button>:

          <div className="text-sm lg:text-base flex flex-row-reverse items-center gap-3">
            <Link className="peer" to={"/" + account}>
              <img
                className={"duration-150 ease-in-out h-10 lg:h-12 border-2 border-primary/80 " +
                  "shadow-none hover:shadow-primary hover:shadow-[0_0_10px_0px]"
                }
                src={getIdenticon({value: account, size: 48})}
              />
            </Link>
            <span className="peer-hover:text-primary/80 duration-150 ease-in-out text-white/50 font-semibold">
              { isMobile?reduceAddress(account):account }
            </span>
          </div>
        }

      </nav>

      <Routes>

        <Route path="/" element={
          !account?
          <Home hasMetaMask={hasMetaMask} contract={contract} owner={owner}/>:
          contract?
          <Feed account={account} contract={contract} isMobile={isMobile} owner={owner}/>:
          <LoaderAnimation py="5em"/>
        }/>

        <Route path="/:address" element={
          !account?
          <Navigate replace to="/"/>:
          contract?
          <Account account={account} contract={contract} owner={owner}/>:
          <LoaderAnimation py="5em"/>
        }/>

        <Route path="/*" element={
          <NotFound/>
        }/>
      </Routes>

    </Router>
  );
}

export default App;
