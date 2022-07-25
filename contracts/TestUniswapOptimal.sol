// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/Uniswap.sol";

contract TestUniswapOptimal{
    using SafeMath for uint;

    address private constant FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address private constant ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function getSwapAmount(uint r, uint a) public pure returns (uint) {
        return (sqrt(r.mul(r.mul(3988009)) + a.mul(r.mul(3988000))).sub(r.mul(1997))).div(1994);
    }

    function _swap(address _tokenA, address _tokenB, uint _amount) internal {
        IERC20(_tokenA).approve(ROUTER, _amount);
        address[] memory path;
        path = new address[](2);
        path[0]=_tokenA;
        path[1]=_tokenB;
        IUniswapV2Router(ROUTER).swapExactTokensForTokens(_amount, 0, path, address(this), block.timestamp);
    }

    function _addLiquidity(address _tokenA, address _tokenB) internal {
        uint _amountA = IERC20(_tokenA).balanceOf(address(this));
        uint _amountB = IERC20(_tokenB).balanceOf(address(this));

        IERC20(_tokenA).approve(ROUTER, _amountA);
        IERC20(_tokenB).approve(ROUTER, _amountB);

        IUniswapV2Router(ROUTER).addLiquidity(_tokenA, _tokenB, _amountA, _amountB, 0, 0, address(this), block.timestamp);
    } 

    function zap(
        address _tokenA,
        address _tokenB,
        uint _amountA
    ) external {
        IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);

        address pair = IUniswapV2Factory(FACTORY).getPair(_tokenA, _tokenB);
        (uint reserve0, uint reserve1,  ) = IUniswapV2Pair(pair).getReserves();

        uint swapAmount;
        if(IUniswapV2Pair(pair).token0()==_tokenA){
            swapAmount=getSwapAmount(reserve0, _amountA);
        }
        else{
            swapAmount=getSwapAmount(reserve1, _amountA);
        }

        _swap(_tokenA, _tokenB, swapAmount);
        _addLiquidity(_tokenA, _tokenB);
    }

    function subOptimalZap(address _tokenA, address _tokenB, uint _amountA) external{
        IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);

        _swap(_tokenA, _tokenB, _amountA.div(2));
        _addLiquidity(_tokenA, _tokenB);
    }

    function getPair(address _tokenA, address _tokenB) external view returns (address) {
        return IUniswapV2Factory(FACTORY).getPair(_tokenA, _tokenB);
    }

}