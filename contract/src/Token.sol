// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HotelToken is ERC20{
    constructor() ERC20("HotelToken", "HTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(uint256 amount) public  {
        _mint(msg.sender,amount * 10 ** decimals());
    }

    function balanceOfCaller() public view returns (uint256) {
        return balanceOf(msg.sender);
    }

    // 查询授权额度的方法
    function allowanceOfCaller(address spender) public view returns (uint256) {
        return allowance(msg.sender, spender);
    }

    // 授予授权额度的方法
    function approveSpender(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
}
