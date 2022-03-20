import Identicon from 'identicon.js';

export const ownerName = "ndavd";

export const reduceAddress = (a: string): string => {
  return a.slice(0, 5) + "..." + a.slice(a.length - 4);
}

interface GetIdenticon {
  value:   string;
  size:    number;
  bg?:     number[];
  margin?: number;
}

export const getIdenticon = ({ value, size, bg = [0,0,0,0], margin = 0.1 }: GetIdenticon): string => {
  const options = {
    background: bg,
    margin,
    size
  };
  return "data:image/png;base64," + new Identicon(value, options as any).toString();
}

export interface Kweet {
  id:        number;
  author:    string;
  content:   string;
  voteCount: number;
  timestamp: number;
  hasVoted:  boolean;
}

export type SortBy = "newest" | "most voted";

export const fetchOrderedKweets =
  async (contract: any, account: string, sortBy: SortBy = "newest", list: number[] = []) => {

  const totalKweets = await contract.methods.totalKweets().call();
  let kweets: Kweet[] = [];

  if (list.length === 0) {
    for (let i = 0; i < totalKweets; i++) {
      const k = await contract.methods.kweets(i+1).call();
      const voted = await contract.methods.hasVoted(account, k.id).call();
      kweets.push({
        id:        k.id,
        author:    k.author,
        content:   k.content,
        voteCount: k.voteCount,
        timestamp: k.timestamp,
        hasVoted:  voted,
      });
    }
  } else {
    for (let i = 0; i < list.length; i++) {
      const k = await contract.methods.kweets(list[i]).call();
      const voted = await contract.methods.hasVoted(account, k.id).call();
      kweets.push({
        id:        k.id,
        author:    k.author,
        content:   k.content,
        voteCount: k.voteCount,
        timestamp: k.timestamp,
        hasVoted:  voted,
      });
    }
  }

  kweets.reverse();

  if (sortBy === "most voted") {
    kweets.sort(
      (a, b) => b.voteCount - a.voteCount
    );
  }

  return kweets;
}
