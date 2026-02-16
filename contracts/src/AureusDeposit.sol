// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AureusDeposit
 * @notice Smart contract pour accepter les dépôts multi-crypto et convertir en USDC
 * @dev Utilise Uniswap V3 pour la conversion automatique
 */
contract AureusDeposit is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ State Variables ============
    IERC20 public immutable usdcToken;
    address public immutable uniswapRouter; // Uniswap V3 Router ou 1inch Aggregator
    
    // Mapping pour stocker les soldes utilisateurs
    mapping(address => uint256) public userBalances; // userAddress => USDC balance
    
    // Liste des tokens acceptés
    mapping(address => bool) public acceptedTokens;
    
    // Adresses des tokens acceptés sur Base Mainnet
    // ETH: address(0) - natif
    // USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
    // USDT: 0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2
    // DAI: 0x50c5725949A6F0c72E6C4a641F24049A917E0C69
    // LINK: 0x88DfaAABaf06f3a41D2606EA98BC8edA109AbeBb
    // WBTC: 0x3cebB9fE4C4B0B1C2e3b4c5D6E7F8A9B0C1D2E3 (à vérifier)
    
    // ============ Events ============
    event Deposit(
        address indexed user,
        address indexed token,
        uint256 tokenAmount,
        uint256 usdcAmount
    );
    
    event BalanceUpdated(
        address indexed user,
        uint256 newBalance
    );
    
    event Withdrawal(
        address indexed user,
        uint256 amount
    );

    constructor(
        address _usdcToken,
        address _uniswapRouter
    ) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        uniswapRouter = _uniswapRouter;
        
        // Accepter USDC directement
        acceptedTokens[_usdcToken] = true;
    }

    /**
     * @notice Ajouter un token accepté pour les dépôts
     */
    function addAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = true;
    }

    /**
     * @notice Retirer un token accepté
     */
    function removeAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = false;
    }

    /**
     * @notice Dépôt avec ETH
     * @dev Convertit ETH en USDC via Uniswap
     */
    function depositETH() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        
        // Convertir ETH en USDC via Uniswap
        uint256 usdcAmount = _swapETHForUSDC(msg.value);
        
        // Créditer le compte utilisateur
        userBalances[msg.sender] += usdcAmount;
        
        emit Deposit(msg.sender, address(0), msg.value, usdcAmount);
        emit BalanceUpdated(msg.sender, userBalances[msg.sender]);
    }

    /**
     * @notice Dépôt avec un token ERC20
     * @param token Adresse du token à déposer
     * @param amount Montant du token à déposer
     */
    function depositToken(address token, uint256 amount) external nonReentrant {
        require(acceptedTokens[token], "Token not accepted");
        require(amount > 0, "Amount must be > 0");
        
        // Transférer le token depuis l'utilisateur
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        uint256 usdcAmount;
        
        // Si c'est déjà USDC, pas besoin de swap
        if (token == address(usdcToken)) {
            usdcAmount = amount;
        } else {
            // Convertir le token en USDC via Uniswap
            usdcAmount = _swapTokenForUSDC(token, amount);
        }
        
        // Créditer le compte utilisateur
        userBalances[msg.sender] += usdcAmount;
        
        emit Deposit(msg.sender, token, amount, usdcAmount);
        emit BalanceUpdated(msg.sender, userBalances[msg.sender]);
    }

    /**
     * @notice Retirer des USDC vers un wallet externe
     * @param to Adresse de destination
     * @param amount Montant en USDC à retirer
     */
    function withdraw(address to, uint256 amount) external nonReentrant {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        require(to != address(0), "Invalid address");
        
        userBalances[msg.sender] -= amount;
        usdcToken.safeTransfer(to, amount);
        
        emit Withdrawal(msg.sender, amount);
        emit BalanceUpdated(msg.sender, userBalances[msg.sender]);
    }

    /**
     * @notice Obtenir le solde d'un utilisateur
     */
    function getBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }

    /**
     * @notice Convertir ETH en USDC via Uniswap
     * @dev À implémenter avec l'interface Uniswap V3 ou 1inch
     */
    function _swapETHForUSDC(uint256 ethAmount) internal returns (uint256) {
        // TODO: Implémenter le swap via Uniswap V3 Router
        // Pour l'instant, on simule avec un taux fixe (1 ETH = 3000 USDC)
        // En production, utiliser ISwapRouter de Uniswap V3
        
        // Exemple avec Uniswap V3:
        // ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
        //     tokenIn: WETH,
        //     tokenOut: address(usdcToken),
        //     fee: 3000,
        //     recipient: address(this),
        //     deadline: block.timestamp + 300,
        //     amountIn: ethAmount,
        //     amountOutMinimum: 0,
        //     sqrtPriceLimitX96: 0
        // });
        // return ISwapRouter(uniswapRouter).exactInputSingle{value: ethAmount}(params);
        
        // Simulation pour le moment
        return (ethAmount * 3000 * 1e6) / 1e18; // Approximation
    }

    /**
     * @notice Convertir un token ERC20 en USDC via Uniswap
     */
    function _swapTokenForUSDC(address token, uint256 amount) internal returns (uint256) {
        // TODO: Implémenter le swap via Uniswap V3 ou 1inch
        // Pour l'instant, on simule
        
        // Exemple avec Uniswap V3:
        // IERC20(token).approve(uniswapRouter, amount);
        // ISwapRouter.ExactInputSingleParams memory params = ...;
        // return ISwapRouter(uniswapRouter).exactInputSingle(params);
        
        // Simulation pour le moment
        // En production, utiliser le vrai router
        return amount; // Approximation
    }

    /**
     * @notice Fonction d'urgence pour retirer les fonds
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }
}

