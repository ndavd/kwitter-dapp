Summary
 - [timestamp](#timestamp) (1 results) (Low)
 - [solc-version](#solc-version) (2 results) (Informational)
## timestamp
Impact: Low
Confidence: Medium
 - [ ] ID-0
[Kwitter.vote(uint256)](contracts/Kwitter.sol#L95-L121) uses timestamp for comparisons
	Dangerous comparisons:
	- [require(bool,string)(kweets[id].author != msg.sender,The kweet author cannot vote his own kweet)](contracts/Kwitter.sol#L98-L101)

contracts/Kwitter.sol#L95-L121


## solc-version
Impact: Informational
Confidence: High
 - [ ] ID-1
solc-0.8.20 is not recommended for deployment

 - [ ] ID-2
Pragma version[^0.8.20](contracts/Kwitter.sol#L2) necessitates a version too recent to be trusted. Consider deploying with 0.8.18.

contracts/Kwitter.sol#L2


