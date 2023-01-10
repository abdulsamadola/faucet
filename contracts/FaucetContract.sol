// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Faucet {
    // storage variables
    address[] public funders;
    uint private numberOfFunders;
    mapping(address => bool) private funderss;
    
    receive() external payable {}

    function addFunds() external payable {
        funders.push(msg.sender);
    }

    function getAllFunders() public view returns (address[] memory) {
        return funders;
    }

    function addNewFunder () external {
        if(!funderss[msg.sender]){
             numberOfFunders++;
            funderss[msg.sender] = true;
        }
        address[] memory newFunders = new address[](numberOfFunders);

        for (uint256 index = 0; index < numberOfFunders; index++) {
        }
    }
modifier limitWithdraw(uint amount) {
    require(amount <= 0.1 ether, "You can only withdraw 0.1 ether at a time");
_;
}

function withdraw (uint amount) external limitWithdraw(amount) {
    payable(msg.sender).transfer(amount);
}
    function getFunderAtIndex(uint8 index) public view returns (address) {
        address[] memory _funders = getAllFunders();
        return _funders[index];
    }

}