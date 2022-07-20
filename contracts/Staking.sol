// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error Staking__TransferFailed();
error Staking__AmountShouldBeMoreThanZero();

contract Staking{

    IERC20 public stakingToken;
    IERC20 public rewardToken;

    uint256 public constant REWARD_RATE=100;

    uint256 public rewardPerTokenStored;
    uint256 public lastRewardTimestamp;
    uint256 public totalSupply;
    
    mapping(address=>uint256) balances;
    mapping(address=>uint256) rewards;
    mapping(address=>uint256) userRewardPerTokenPaid;

    modifier moreThanZero(uint amount) {
        if(amount==0){
            revert Staking__AmountShouldBeMoreThanZero();
        }
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored=rewardPerToken();
        lastRewardTimestamp = block.timestamp;
        rewards[account] = earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        _;
    }

    constructor(address _stakingToken, address _rewardToken){
        stakingToken=IERC20(_stakingToken);
        rewardToken=IERC20(_rewardToken);
    }

    function earned(address account) public view returns(uint){
        uint256 currentBalance = balances[account];
        uint256 currentRewardPerToken = rewardPerToken();
        uint256 amountPaid = userRewardPerTokenPaid[account];
        uint256 pastRewards = rewards[account]; 
        uint256 _earned = ((currentBalance * (currentRewardPerToken - amountPaid)) / 1e18) + pastRewards;
        return _earned;
    }

    function rewardPerToken() public view returns(uint) {
        if(totalSupply==0){
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + ((block.timestamp-lastRewardTimestamp)*REWARD_RATE*1e18);
    }

    function stake(uint256 amount) external moreThanZero(amount) updateReward(msg.sender) {
        balances[msg.sender] = balances[msg.sender] + amount;
        totalSupply= totalSupply + amount;
        bool success = stakingToken.transferFrom(msg.sender, address(this), amount);
        if(!success){
            revert Staking__TransferFailed();
        }
    }

    function withdraw(uint256 amount) external moreThanZero(amount) updateReward(msg.sender) {
        balances[msg.sender] = balances[msg.sender] + amount;
        totalSupply= totalSupply+amount;
        bool success = stakingToken.transfer(msg.sender, amount);
        if(!success){
            revert Staking__TransferFailed();
        }
    }


    function claimRewards() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        bool success = rewardToken.transfer(msg.sender, reward);
        if(!success){
            revert Staking__TransferFailed(); 
        }
    }

}