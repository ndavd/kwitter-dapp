import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kweet, reduceAddress, getHashprint } from '../utils';
import useWindowWidth from './useWindowWidth';

interface Props {
  list: Kweet[];
  account: string;
  contract: any;
  owner: string;
  showAuthor?: boolean;
}

const Kweets = ( { list, contract, account, owner, showAuthor = true }: Props ) => {
  const isSmall = useWindowWidth() < 768;

  const hashprintRefs = useRef<(HTMLImageElement|null)[]>([]);

  const voteRefs = useRef<(HTMLButtonElement|null)[]>([]);

  const [ price, setPrice ] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const v = await contract.methods.votePrice().call();
      setPrice(v);
      for (let i = 0; i <= list.length; i++) {
        if (list[i] && hashprintRefs.current[i]) {
          hashprintRefs.current[i]!.src = await getHashprint(list[i].author, 64);
        }
      }
    }
    load();
  }, []);

  const submitVote = async (id: number, index: number) => {
    try {
      await contract.methods
        .vote(id)
        .send({
          from: account,
          value: price
        });
      // Update the button styling and increment the vote count
      voteRefs.current[index]!.disabled = true;
      voteRefs.current[index]!.childNodes[0].nodeValue =
        voteRefs.current[index]!.childNodes[0].nodeValue!
          .replace(/^(\d+) (vote.*)/, (_, n) => {
            const count = (+n+1);
            const str = count === 1 ? "vote" : "votes";
            return count + " " + str;
          });
    } catch (err: any) {
      if (err.code !== 4001) console.error(err);
    }
  }

  return (
    <ul className="mb-4">
      {
        list.map((k: Kweet, i: number) => {
          const date = new Date(k.timestamp * 1000).toLocaleString();
          const vote = k.voteCount + " " + (k.voteCount!=1?"votes":"vote");
          const isOwner  = k.author == owner;
          const isAuthor = k.author == account;

          return (
            <li key={i}
              className={
                `relative group sm:hover:bg-secondary-transparent border-2
                border-secondary-light py-2 pb-10 min-h-[6rem] px-2 font-semibold
                text-secondary/75
                ${showAuthor?" pl-8":""}
                ${(i===0)?"rounded-t-md sm:rounded-t-xl":""}
                ${(i!==list.length-1)?"border-b-0":"rounded-b-md sm:rounded-b-xl"}`
              }
            >

              { showAuthor && <>
                <Link to={"/" + k.author}>
                  <img ref={(e) => hashprintRefs.current.push(e)}
                    className={`absolute -left-3 bg-white p-1 sm:-left-6 -top-3 h-10 w-10 sm:h-12 sm:w-12 border-2
                      ${!isOwner?"border-primary-dark":"border-yellow-500"}
                    `}
                  />
                </Link>
                <div className={
                    `absolute -top-3 text-xs sm:text-sm px-1 rounded bg-white
                    sm:group-hover:bg-secondary-transparent
                    ${!isOwner?"text-primary-dark/70":"text-yellow-500/80"}`
                  }
                >
                  {isSmall?reduceAddress(k.author):k.author}
                </div></>
              }

              <div className="translate-x-1 text-base sm:text-lg break-words">
                {k.content}
              </div>

              <div className="text-secondary/50 z-20 text-xs absolute bottom-0 right-0">
                {date}
                <button
                  ref={(e) => voteRefs.current.push(e)}
                  className={
                    `text-base font-mono min-w-[10ch] sm:text-lg font-semibold
                    rounded-tl sm:rounded-tl-lg border-t-2 border-l-2 italic ml-2
                    duration-150 ease-in-out text-primary-dark border-primary-dark
                    hover:bg-primary-dark/20 disabled:text-white
                    ${(!isAuthor || k.hasVoted)?
                      "disabled:bg-primary-dark":
                      "disabled:border-transparent disabled:bg-secondary-light"
                    }
                    ${(i!==list.length-1)?"border-b-0":"rounded-br sm:rounded-br-lg"}
                  `}
                  onClick={ () => submitVote(k.id, i) }
                  disabled={ isAuthor || k.hasVoted }
                >
                  {vote}
                </button>
              </div>

            </li>
          );
        })
      }
    </ul>
  );
}

export default React.memo(Kweets);
