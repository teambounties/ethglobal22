// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Token{
        string public name="TeamBounties";
        string public symbol="TB";
        string public standard="TB v1.0";
        uint256 public totalSupply;
        
        event Transfer(address indexed From_this_account,address  indexed to_this_account,uint total_token);
        event Approval(address indexed owner_address ,address indexed spender_address ,uint maximum_token_limit);

        mapping(address=>uint) public balanceOf;
        mapping(address=>mapping(address=>uint)) public allowance;

        constructor (uint256 _totalSupply)
        {
            uint256 _wei = _totalSupply * (10 ** uint256(18));
            balanceOf[msg.sender]= _wei;
            totalSupply= _wei;
        }

        function transfer(address _to,uint _value) public returns(bool)
        {
            require(balanceOf[msg.sender]>=_value,"insufficient tokens in this account");
            balanceOf[msg.sender] -=_value;
            balanceOf[_to] +=_value;
            emit Transfer(msg.sender,_to,_value);
            return true;
        }

        function approve(address _spender,uint _value) public returns(bool)
        {
            require(balanceOf[msg.sender] >=_value,"you cannot approve tokens more than your current balance");
            require(allowance[msg.sender][_spender]==0,"tokens are already approved");
            allowance[msg.sender][_spender]=_value;
            emit Approval(msg.sender,_spender,_value);
            return true;
        }

        function transferFrom(address _from,address _to,uint _value) public returns(bool)
        {
            require(allowance[_from][msg.sender] >0,"You do not have permission to transfer tokens from owner address");
            require(allowance[_from][msg.sender] >=_value,"you cannot transfer tokens more than your approved limit");
            require(balanceOf[_from] >=_value,"your owner has insufficient tokens in his wallet");
            
            balanceOf[_from] -=_value;
            balanceOf[_to] +=_value;
            allowance[_from][msg.sender] -=_value;
            emit Transfer(_from,_to,_value);
            return true;     
        }

}