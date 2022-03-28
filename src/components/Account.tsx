import { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { Kweet, SortBy, reduceAddress, fetchOrderedKweets, getHashprint } from '../utils';
import useWindowWidth from './useWindowWidth';
import Kweets from './Kweets';
import LoaderAnimation from './LoaderAnimation';
import NotFound from './NotFound';

interface Props {
  contract: any;
  account: string;
  owner: string;
}

const Account = ( { contract, account, owner }: Props ) => {
  const acc = useParams().address as string;

  const [ hashprint, setHashprint ] = useState<string>("");

  const isSmall = useWindowWidth() < 768;

  const [ wasFound, setWasFound ] = useState<boolean>(true);

  const [ sortBy, setSortBy ] = useState<SortBy>("newest");

  const [ ids, setIds ] = useState<number[]>([]);
  const [ kweetList, setKweetList ] = useState<Kweet[]>([]);

  const [ firstKweetDate, setFirstKweetDate ] = useState<string>("");

  const getKweets = async () => {
    const kweets = await fetchOrderedKweets(
      contract,
      account,
      sortBy,
      ids,
    );

    setKweetList(kweets);

    if (firstKweetDate === "") {
      setFirstKweetDate(
        new Date(kweets[0].timestamp * 1000).toLocaleDateString()
      );
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const kweetIds = await contract.methods
          .getAccountKweets(acc).call();

        if (kweetIds.length === 0) {
          setWasFound(false);
        }

        setIds(kweetIds);
      } catch (err) {
        setWasFound(false);
      }
    }
    load();
  }, [acc]);

  useEffect(() => {
    if (ids.length === 0) return;
    const load = async () => {
      const hashprint = await getHashprint(acc, 140);
      setHashprint(hashprint)

      // Reset kweet list
      setKweetList([]);

      await getKweets();
    };
    load();
  }, [sortBy, ids]);

  return <>
    <HelmetProvider>
      <Helmet>
        <title>{acc} - Kwitter</title>
      </Helmet>
    </HelmetProvider>

    { wasFound ?

      <main
        className={
          "flex flex-col text-secondary md:max-w-3xl px-4 " +
          "sm:px-8 md:px-10 lg:px-0 mx-auto min-h-screen pt-[4.5rem] sm:pt-28"
        }
      >
        { acc === account &&
          <div className={
            "px-2 mb-2 self-end font-semibold italic rounded-md sm:rounded-lg bg-primary"
          }>
            this is you
          </div>
        }

        { acc === owner &&
          <div className={
            "px-2 mb-2 font-semibold italic text-center rounded-md sm:rounded-lg text-white bg-yellow-500"
          }>
            This account belongs to the Kwitter&apos;s founder
          </div>
        }

        <section
          className={
            "border-2 sm:border-4 border-secondary-light rounded-r-md sm:rounded-r-2xl " +
            "mb-4 w-full flex text-secondary/70"
          }
        >
          <img
            className="w-24 h-24 sm:w-32 sm:h-32 outline outline-2 sm:outline-4 outline-secondary-light bg-secondary-light/50"
            src={ hashprint }
          />
          <div className="px-2 sm:px-4 font-semibold text-base sm:text-lg flex flex-col justify-between w-full">
            <div>
              <div>{isSmall?reduceAddress(acc):acc}</div>
              <button
                onClick={ () => navigator.clipboard.writeText(acc) }
                className="hidden sm:inline italic font-semibold text-secondary/40"
              >
                copy address
              </button>
              <a target="_blank" rel="noopener noreferrer"
                className="block sm:inline sm:pl-4 italic font-semibold text-secondary/40 hover:underline"
                href={"https://kovan.etherscan.io/address/" + acc}
              >
                view on Etherscan
              </a>
            </div>
            <div className="text-base flex justify-between">
              <div>
                <span className="text-secondary/40">kweets: </span>{kweetList.length}
              </div>
              <div className="hidden sm:block text-right sm:text-left italic text-secondary/40">
                first kweeted on <span className="text-secondary/40">{firstKweetDate}</span>
              </div>
            </div>
          </div>
        </section>

        <button
          className={
            "mb-2 self-end flex rounded-md sm:rounded-lg font-semibold " +
            "border-2 border-primary-dark text-primary-dark"
          }
          onClick={() => setSortBy(e=>e==="newest"?"most voted":"newest")}
        >
          <span className={"text-center w-24 "+(sortBy==="newest"?"bg-primary-dark text-white":"")}>
            newest
          </span>
          <span className={"text-center w-24 "+(sortBy==="most voted"?"bg-primary-dark text-white":"")}>
            most voted
          </span>
        </button>

        {
          (kweetList.length > 0) ?
          <Kweets
            list={kweetList}
            contract={contract}
            account={account}
            owner={owner}
            showAuthor={false}
          />:
          <LoaderAnimation
            py="1.5em"
          />
        }
      </main>
      :<NotFound/>
    }
  </>;
}

export default Account;
