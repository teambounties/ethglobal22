// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./Team.sol";

contract Factory{
     uint count;
     Team[] public teams;
  	 string[] public names;
     address payable owner;

    event TeamCreated(address, address);
    event ReceivedFromToValue(address, address, uint);
  	event DebugFromToValue(string, address, address, uint);

    modifier hasTeams {
        require(teams.length==0, "No team yet");
        _;
    }

    modifier notOwned {
        require(owner==address(0), "Already owned");
        _;
    }

    modifier owned {
        require(owner!=address(0), "Not owned");
        _;
    }

    function createTeam(string memory name, string[] memory _nicks, string[] memory _avatars, address payable [] memory _addresses, uint8[] memory _shares) public returns (address){
       names.push(name);
       Team team = new Team(payable(msg.sender), _nicks,_avatars,_addresses,_shares);
       teams.push(team);
       count++;
       emit TeamCreated(address(team), msg.sender);
       owner = payable(msg.sender);
       return address(team);
     }
     
     function getAddress() external view returns(address){
       return address(this);
     }

     function getTeams() external view returns(Team[] memory _teams){
       return teams;
     }
     
     function getCount() external view returns(uint){
       return teams.length;
     }
     
     function getTeamAddress(uint _index) external view returns(address){
       return address(teams[_index]);
     }

     function getLastTeamAddress() external view returns(address){
       return address(teams[teams.length-1]);
     }

     function getTeam(uint _index) external view returns(Team){
       return teams[_index];
     }

     receive () external payable {
       emit ReceivedFromToValue(msg.sender, address(this), msg.value);
     }

     function setOwner(address _owner) public notOwned {
        owner = payable(_owner);
     }

     function getOwner() view public returns (address){
        return owner;
     }

     function dust() external payable owned {
        uint balance = address(this).balance;
        if(balance > 0){
          emit DebugFromToValue("Send Remaining to owner", address(this), owner, balance);
          (bool sent, ) = owner.call{value:balance}("");
          require(sent, "Failed to send");	
        }
     }

 
}