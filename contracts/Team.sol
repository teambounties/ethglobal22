// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

struct Member{
	string _nick;
	string _avatar;
	address _address;
	uint8 _share;
}

contract Team {
	bool private initialized;
	uint8 private _count;
	Member[] members;
	string[] nicks;
	address payable[] addresses;
	address payable owner;
	address payable creator;
	event Debug(string msg);
	event DebugValue(string msg, uint);
	event DebugMember(string, string, address payable, uint);
	event DebugFromToValue(string, address, address, uint);
	event ReceivedFromToValue(address, address, uint);
    
	modifier isInitialized {
	  require(initialized, "Contract instance has already been initialized");
	  _;
	}

	modifier hasTeam(uint i) {
	  require(members.length>0, "No team yet");
	  require(i<members.length, "No such member");
	  _;
	}

	constructor (address payable _creator, string[] memory _nicks, string[] memory _avatars, address payable[] memory _addresses, uint8[] memory _shares) {
	 	//require(!initialized, "Contract instance has already been initialized");
        initialized = true;
		emit Debug("initialize ok");
		for(uint i = 0; i< _addresses.length;i++){
			emit DebugMember(_nicks[i], _avatars[i], _addresses[i], _shares[i]);
			members.push(Member(_nicks[i], _avatars[i], _addresses[i], _shares[i]));
		}
		owner = payable(msg.sender);
		creator = _creator;
	}

	function getCount() view public returns (uint){
		return members.length;
	}

	function getBalance() view public returns (uint256 _balance){
		return address(this).balance;
	}

	function getCreator() view public returns (address){
		return creator;
	}

	function getMember(uint i) view public isInitialized hasTeam(i) returns (string memory, string memory, address, uint8) {
		Member storage member = members[i];
		return (member._nick, member._avatar, member._address, member._share);
	}

	receive () external payable {
		emit ReceivedFromToValue(msg.sender, address(this), msg.value);
	}

	function getOwner() view public returns (address){
		return owner;
	}


	function dust() public payable {
		uint balance = address(this).balance;
		if(balance > 0){
			emit DebugFromToValue("Send Remaining to owner", address(this), owner, balance);
			(bool sent, ) = owner.call{value:balance}("");
			require(sent, "Failed to send");	
		}
	}

	function distribute() external payable {
		uint balance = address(this).balance;
		if (balance > 0) {
			emit DebugValue("had balance ", balance);
			for(uint8 i=0; i< members.length;i++){
				Member memory m = members[i];
				uint amount = balance * m._share / 100;
				//emit DebugFromToValue("Send Remaining to owner", address(this), m._address, amount);
				(bool sent, ) = payable(m._address).call{value:amount}("");
				require(sent, "Failed to send");	
			}
			dust();
		}else{
			emit DebugValue("asked to distribute 0? ", msg.value);
		}
	}
	
	fallback () external payable { 
		emit Debug("fallback");
	}
	
}