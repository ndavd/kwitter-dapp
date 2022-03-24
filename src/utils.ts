import Identicon from 'identicon.js';

const hashprint = require("hashprintjs")

export const reduceAddress = (a: string): string => {
  return a.slice(0, 5) + "..." + a.slice(a.length - 4);
}

export const getHashprint = async (data: string, size: number) => {
  return await hashprint({ data, size, likeness: [0.4, 0.2] })
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

  const fetchKweet = async (list: Kweet[], index: number) => {
    const k = await contract.methods.kweets(index).call();
    if (k.id === 0) return;

    const voted = await contract.methods.hasVoted(account, k.id).call();
    list.push({
      id:        k.id,
      author:    k.author,
      content:   k.content,
      voteCount: k.voteCount,
      timestamp: k.timestamp,
      hasVoted:  voted,
    });
  }

  const totalKweets = await contract.methods.totalKweets().call();
  let kweets: Kweet[] = [];

  if (list.length === 0) {
    for (let i = 0; i < totalKweets; i++) {
      await fetchKweet(kweets, i + 1);
    }
  } else {
    for (let i = 0; i < list.length; i++) {
      await fetchKweet(kweets, list[i]);
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
