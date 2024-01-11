// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* ====================================================================== */
/*  88      a8P                  88                    kwitter.ndavd.com  */
/*  88    ,88'                   ""   ,d      ,d                          */
/*  88  ,88"                          88      88                          */
/*  88,d88'   8b      db      d8 88 MM88MMM MM88MMM ,adPPYba, 8b,dPPYba,  */
/*  8888"88,  `8b    d88b    d8' 88   88      88   a8P_____88 88P'   "Y8  */
/*  88P   Y8b  `8b  d8'`8b  d8'  88   88      88   8PP""""""" 88          */
/*  88     "88, `8bd8'  `8bd8'   88   88,     88,  "8b,   ,aa 88          */
/*  88       Y8b  YP      YP     88   "Y888   "Y888 `"Ybbd8"' 88          */
/* ====================================================================== */

contract Kwitter {
    // Contract owner
    address payable public immutable owner;
    // Kweet count
    uint public totalKweets = 0;
    // Prices charged
    uint public constant kweetPrice = 0.01 ether;
    uint public constant votePrice = 0.002 ether;
    // Kweet getter by id (uint)
    mapping(uint => Kweet) public kweets;
    // Each account (address) is comprised of an array of kweets (uint)
    mapping(address => uint[]) public accounts;
    // Keep track of whether the account (address) has voted (bool) on a post (uint)
    mapping(address => mapping(uint => bool)) public hasVoted;

    struct Kweet {
        uint id;
        address payable author;
        string content;
        uint voteCount;
        uint timestamp;
    }

    event NewKweet(uint id);

    event NewVote(uint id);

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can perform this action"
        );
        _;
    }

    modifier costs(uint amount) {
        require(msg.value >= amount, "Not enough paid");
        _;
    }

    modifier hasValidLength(string memory _content) {
        require(
            bytes(_content).length > 0 && bytes(_content).length <= 256,
            "Each kweet should have between 1 and 256 bytes"
        );
        _;
    }

    modifier hasValidId(uint _id) {
        require(_id > 0 && _id <= totalKweets, "The kweet id is not valid");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function getAccountKweets(
        address account
    ) public view returns (uint[] memory) {
        return accounts[account];
    }

    function kweet(
        string memory content
    ) public payable costs(kweetPrice) hasValidLength(content) {
        totalKweets++;

        kweets[totalKweets] = Kweet(
            totalKweets,
            payable(msg.sender),
            content,
            0,
            block.timestamp
        );
        accounts[msg.sender].push(totalKweets);

        emit NewKweet(totalKweets);
    }

    function vote(
        uint id
    ) public payable costs(votePrice) hasValidId(kweets[id].id) {
        require(
            kweets[id].author != msg.sender,
            "The kweet author cannot vote his own kweet"
        );
        require(
            !hasVoted[msg.sender][id],
            "Each account can only vote a kweet once"
        );

        Kweet memory _kweet = kweets[id];
        _kweet.voteCount++;
        kweets[id] = _kweet;

        hasVoted[msg.sender][id] = true;

        emit NewVote(id);

        // Every 10 kweet votes reward its author
        // (and give the contract owner a small gift :])
        if (_kweet.voteCount != 0 && _kweet.voteCount % 10 == 0) {
            (_kweet.author).transfer(votePrice * 8);
            owner.transfer(votePrice * 1);
        }
    }

    // Just a basic way for the owner to moderate the feed.
    // Meant to be used only in extreme cases.
    function deleteKweet(uint id) public onlyOwner {
        delete kweets[id];
    }
}
