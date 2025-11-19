// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title AureusLottery
 * @notice Decentralized lottery with Chainlink VRF for provably fair randomness
 * @dev Split: 85% main pot, 5% bonus pot, 10% treasury
 *      Main draw: 21:00 UTC, Bonus draw: 21:30 UTC (30 minutes interval)
 */
contract AureusLottery is VRFConsumerBaseV2, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant TICKET_PRICE = 1e6; // 1 USDC (6 decimals)
    uint256 public constant MAIN_POT_PERCENT = 85; // 85% to main pot
    uint256 public constant BONUS_POT_PERCENT = 5; // 5% to bonus pot
    uint256 public constant TREASURY_PERCENT = 10; // 10% to treasury
    uint256 public constant BONUS_WINNERS_COUNT = 25; // 25 bonus winners
    uint256 public constant PERCENT_BASE = 100;

    // ============ State Variables ============
    IERC20 public immutable usdcToken;
    address public treasury;

    // VRF Configuration
    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    bytes32 public keyHash;
    uint64 public vrfSubscriptionId;
    uint32 public callbackGasLimit;
    uint16 public requestConfirmations;

    // Draw Management
    uint256 public currentDrawId;
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => bool) public drawFinalized;

    // Ticket Management
    mapping(uint256 => Ticket[]) public tickets; // drawId => tickets
    mapping(uint256 => mapping(address => uint256)) public userTickets; // drawId => user => count
    mapping(address => uint256) public lifetimeTickets;

    // Quick Buy Deals (exact quantities only)
    mapping(uint256 => uint256) public quickDealDiscounts; // quantity => discount (in basis points, 100 = 1%)
    bool public quickDealsEnabled;

    // Pending Claims
    mapping(uint256 => mapping(address => uint256)) public pendingClaims; // drawId => user => amount
    mapping(uint256 => mapping(address => bool)) public claimed; // drawId => user => claimed

    // ============ Structs ============
    struct Draw {
        uint256 drawId;
        uint256 mainPot;
        uint256 bonusPot;
        uint256 totalTickets;
        uint64 mainDrawTime; // 21:00 UTC
        uint64 bonusDrawTime; // 21:30 UTC (30 minutes after main)
        address mainWinner;
        uint256 mainPrize;
        address[] bonusWinners;
        uint256 bonusPrizeEach;
        bool mainDrawFinalized;
        bool bonusDrawFinalized;
    }

    struct Ticket {
        address buyer;
        uint256 timestamp;
    }

    // ============ Events ============
    event TicketsPurchased(
        uint256 indexed drawId,
        address indexed buyer,
        uint256 count,
        uint256 totalPaid,
        uint256 mainPotContribution,
        uint256 bonusPotContribution,
        uint256 treasuryContribution
    );

    event DrawRequested(
        uint256 indexed drawId,
        uint256 indexed requestId,
        string drawType
    );

    event MainDrawFinalized(
        uint256 indexed drawId,
        address indexed winner,
        uint256 prize,
        uint256 randomSeed
    );

    event BonusDrawFinalized(
        uint256 indexed drawId,
        address[] winners,
        uint256 prizeEach,
        uint256 leftover
    );

    event PayoutSent(
        uint256 indexed drawId,
        address indexed to,
        uint256 amount,
        string drawType
    );

    event PayoutPendingClaim(
        uint256 indexed drawId,
        address indexed to,
        uint256 amount,
        string drawType
    );

    event Claimed(
        uint256 indexed drawId,
        address indexed by,
        uint256 amount,
        string drawType
    );

    event ConfigUpdated(string key, uint256 oldValue, uint256 newValue);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // ============ Modifiers ============
    modifier validDraw(uint256 _drawId) {
        require(_drawId > 0 && _drawId <= currentDrawId, "Invalid draw ID");
        _;
    }

    // ============ Constructor ============
    constructor(
        address _usdcToken,
        address _treasury,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _vrfSubscriptionId,
        uint32 _callbackGasLimit
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_vrfCoordinator != address(0), "Invalid VRF coordinator");

        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        vrfSubscriptionId = _vrfSubscriptionId;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = 3;

        // Initialize first draw
        currentDrawId = 1;
        draws[currentDrawId] = Draw({
            drawId: currentDrawId,
            mainPot: 0,
            bonusPot: 0,
            totalTickets: 0,
            mainDrawTime: 0,
            bonusDrawTime: 0,
            mainWinner: address(0),
            mainPrize: 0,
            bonusWinners: new address[](0),
            bonusPrizeEach: 0,
            mainDrawFinalized: false,
            bonusDrawFinalized: false
        });

        // Quick Buy Deals (basis points: 200 = 2%, 500 = 5%, etc.)
        quickDealDiscounts[5] = 200;   // 2% off
        quickDealDiscounts[10] = 300;  // 3% off
        quickDealDiscounts[20] = 500;  // 5% off
        quickDealDiscounts[50] = 800;  // 8% off
        quickDealDiscounts[100] = 1200; // 12% off
        quickDealDiscounts[1000] = 2000; // 20% off
        quickDealsEnabled = true;
    }

    // ============ Public Functions ============

    /**
     * @notice Buy tickets for current draw
     * @param _count Number of tickets to buy
     */
    function buyTickets(uint256 _count) external whenNotPaused nonReentrant {
        require(_count > 0, "Count must be > 0");
        require(_count <= 10000, "Max 10,000 tickets per transaction");

        uint256 totalCost = _count * TICKET_PRICE;
        
        // Apply discount if quick deal
        if (quickDealsEnabled && quickDealDiscounts[_count] > 0) {
            uint256 discount = (totalCost * quickDealDiscounts[_count]) / 10000;
            totalCost = totalCost - discount;
        }

        // Transfer USDC from user
        usdcToken.safeTransferFrom(msg.sender, address(this), totalCost);

        // Calculate splits
        uint256 mainPotContribution = (totalCost * MAIN_POT_PERCENT) / PERCENT_BASE;
        uint256 bonusPotContribution = (totalCost * BONUS_POT_PERCENT) / PERCENT_BASE;
        uint256 treasuryContribution = totalCost - mainPotContribution - bonusPotContribution;

        // Update pots
        draws[currentDrawId].mainPot += mainPotContribution;
        draws[currentDrawId].bonusPot += bonusPotContribution;
        draws[currentDrawId].totalTickets += _count;

        // Transfer treasury share immediately
        usdcToken.safeTransfer(treasury, treasuryContribution);

        // Record tickets
        for (uint256 i = 0; i < _count; i++) {
            tickets[currentDrawId].push(Ticket({
                buyer: msg.sender,
                timestamp: block.timestamp
            }));
        }

        userTickets[currentDrawId][msg.sender] += _count;
        lifetimeTickets[msg.sender] += _count;

        emit TicketsPurchased(
            currentDrawId,
            msg.sender,
            _count,
            totalCost,
            mainPotContribution,
            bonusPotContribution,
            treasuryContribution
        );
    }

    /**
     * @notice Request VRF for main draw (called by Chainlink Automation at 21:00 UTC)
     *         Bonus draw will be called 30 minutes later at 21:30 UTC
     */
    function requestMainDraw() external whenNotPaused {
        require(!draws[currentDrawId].mainDrawFinalized, "Main draw already finalized");
        require(draws[currentDrawId].totalTickets > 0, "No tickets sold");

        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            vrfSubscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1 // numWords
        );

        draws[currentDrawId].mainDrawTime = uint64(block.timestamp);

        emit DrawRequested(currentDrawId, requestId, "main");
    }

    /**
     * @notice Request VRF for bonus draw (called by Chainlink Automation at 22:30 UTC)
     */
    function requestBonusDraw() external whenNotPaused {
        require(!draws[currentDrawId].bonusDrawFinalized, "Bonus draw already finalized");
        require(draws[currentDrawId].totalTickets > 0, "No tickets sold");

        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            vrfSubscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1 // numWords
        );

        draws[currentDrawId].bonusDrawTime = uint64(block.timestamp);

        emit DrawRequested(currentDrawId, requestId, "bonus");
    }

    /**
     * @notice VRF callback for main draw
     */
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        // Determine which draw this is for (main or bonus)
        // We'll use a simple approach: check if main is finalized
        if (!draws[currentDrawId].mainDrawFinalized) {
            _finalizeMainDraw(_randomWords[0]);
        } else if (!draws[currentDrawId].bonusDrawFinalized) {
            _finalizeBonusDraw(_randomWords[0]);
        }
    }

    /**
     * @notice Finalize main draw and select winner
     */
    function _finalizeMainDraw(uint256 _randomSeed) internal {
        require(!draws[currentDrawId].mainDrawFinalized, "Already finalized");
        require(draws[currentDrawId].totalTickets > 0, "No tickets");

        uint256 totalTickets = draws[currentDrawId].totalTickets;
        uint256 winnerIndex = _randomSeed % totalTickets;
        
        address winner = tickets[currentDrawId][winnerIndex].buyer;
        uint256 prize = draws[currentDrawId].mainPot;

        draws[currentDrawId].mainWinner = winner;
        draws[currentDrawId].mainPrize = prize;
        draws[currentDrawId].mainDrawFinalized = true;

        // Auto-payout
        _sendPayout(winner, prize, currentDrawId, "main");

        emit MainDrawFinalized(currentDrawId, winner, prize, _randomSeed);
    }

    /**
     * @notice Finalize bonus draw and select 25 winners
     */
    function _finalizeBonusDraw(uint256 _randomSeed) internal {
        require(!draws[currentDrawId].bonusDrawFinalized, "Already finalized");
        require(draws[currentDrawId].totalTickets > 0, "No tickets");

        uint256 totalTickets = draws[currentDrawId].totalTickets;
        uint256 bonusPot = draws[currentDrawId].bonusPot;
        
        // Select 25 unique winners
        address[] memory winners = new address[](BONUS_WINNERS_COUNT);
        uint256[] memory usedIndices = new uint256[](BONUS_WINNERS_COUNT);
        uint256 winnersCount = 0;
        uint256 randomSeed = _randomSeed;

        // If less than 25 tickets, all unique ticket holders win
        if (totalTickets <= BONUS_WINNERS_COUNT) {
            // Get unique addresses
            address[] memory uniqueAddresses = new address[](totalTickets);
            uint256 uniqueCount = 0;
            
            for (uint256 i = 0; i < totalTickets; i++) {
                address ticketOwner = tickets[currentDrawId][i].buyer;
                bool isUnique = true;
                
                for (uint256 j = 0; j < uniqueCount; j++) {
                    if (uniqueAddresses[j] == ticketOwner) {
                        isUnique = false;
                        break;
                    }
                }
                
                if (isUnique) {
                    uniqueAddresses[uniqueCount] = ticketOwner;
                    uniqueCount++;
                }
            }

            winnersCount = uniqueCount;
            for (uint256 i = 0; i < uniqueCount; i++) {
                winners[i] = uniqueAddresses[i];
            }
        } else {
            // Select 25 unique random winners
            while (winnersCount < BONUS_WINNERS_COUNT) {
                randomSeed = uint256(keccak256(abi.encodePacked(randomSeed, block.timestamp, winnersCount)));
                uint256 candidateIndex = randomSeed % totalTickets;
                
                // Check if already selected
                bool alreadySelected = false;
                for (uint256 i = 0; i < winnersCount; i++) {
                    if (usedIndices[i] == candidateIndex) {
                        alreadySelected = true;
                        break;
                    }
                }
                
                if (!alreadySelected) {
                    usedIndices[winnersCount] = candidateIndex;
                    winners[winnersCount] = tickets[currentDrawId][candidateIndex].buyer;
                    winnersCount++;
                }
            }
        }

        // Calculate prize per winner
        uint256 prizeEach = bonusPot / winnersCount;
        uint256 leftover = bonusPot - (prizeEach * winnersCount);

        draws[currentDrawId].bonusWinners = winners;
        draws[currentDrawId].bonusPrizeEach = prizeEach;
        draws[currentDrawId].bonusDrawFinalized = true;

        // Auto-payout to all winners
        for (uint256 i = 0; i < winnersCount; i++) {
            _sendPayout(winners[i], prizeEach, currentDrawId, "bonus");
        }

        // Rollover leftover to next draw bonus pot
        if (leftover > 0 && currentDrawId + 1 > 0) {
            draws[currentDrawId + 1].bonusPot += leftover;
        }

        emit BonusDrawFinalized(currentDrawId, winners, prizeEach, leftover);
    }

    /**
     * @notice Send payout (auto or pending claim)
     */
    function _sendPayout(address _to, uint256 _amount, uint256 _drawId, string memory _drawType) internal {
        if (_amount == 0) return;

        if (_attemptTokenTransfer(_to, _amount)) {
            emit PayoutSent(_drawId, _to, _amount, _drawType);
        } else {
            // If transfer fails (blacklist, etc.), mark as pending claim
            pendingClaims[_drawId][_to] += _amount;
            emit PayoutPendingClaim(_drawId, _to, _amount, _drawType);
        }
    }

    /**
     * @dev Attempt to transfer USDC, catching tokens that return false or revert
     */
    function _attemptTokenTransfer(address _to, uint256 _amount) internal returns (bool) {
        (bool success, bytes memory data) = address(usdcToken).call(
            abi.encodeWithSelector(IERC20.transfer.selector, _to, _amount)
        );

        if (!success) {
            return false;
        }

        if (data.length > 0) {
            return abi.decode(data, (bool));
        }

        return true;
    }

    /**
     * @notice Claim pending payout
     */
    function claim(uint256 _drawId, string memory _drawType) external validDraw(_drawId) nonReentrant {
        require(pendingClaims[_drawId][msg.sender] > 0, "No pending claim");
        require(!claimed[_drawId][msg.sender], "Already claimed");

        uint256 amount = pendingClaims[_drawId][msg.sender];
        pendingClaims[_drawId][msg.sender] = 0;
        claimed[_drawId][msg.sender] = true;

        usdcToken.safeTransfer(msg.sender, amount);

        emit Claimed(_drawId, msg.sender, amount, _drawType);
    }

    /**
     * @notice Start new draw (called after both draws finalized)
     */
    function startNewDraw() external {
        require(
            draws[currentDrawId].mainDrawFinalized && 
            draws[currentDrawId].bonusDrawFinalized,
            "Current draw not finalized"
        );

        currentDrawId++;
        draws[currentDrawId] = Draw({
            drawId: currentDrawId,
            mainPot: 0,
            bonusPot: 0,
            totalTickets: 0,
            mainDrawTime: 0,
            bonusDrawTime: 0,
            mainWinner: address(0),
            mainPrize: 0,
            bonusWinners: new address[](0),
            bonusPrizeEach: 0,
            mainDrawFinalized: false,
            bonusDrawFinalized: false
        });
    }

    // ============ View Functions ============

    /**
     * @notice Get current pot amounts
     */
    function getCurrentPots() external view returns (uint256 mainPot, uint256 bonusPot) {
        mainPot = draws[currentDrawId].mainPot;
        bonusPot = draws[currentDrawId].bonusPot;
    }

    /**
     * @notice Get draw info
     */
    function getDrawInfo(uint256 _drawId) external view validDraw(_drawId) returns (Draw memory) {
        return draws[_drawId];
    }

    /**
     * @notice Get user tickets for a draw
     */
    function getUserTickets(uint256 _drawId, address _user) external view returns (uint256) {
        return userTickets[_drawId][_user];
    }

    /**
     * @notice Get total tickets for a draw
     */
    function getTotalTickets(uint256 _drawId) external view validDraw(_drawId) returns (uint256) {
        return draws[_drawId].totalTickets;
    }

    // ============ Owner Functions ============

    /**
     * @notice Update treasury address
     */
    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }

    /**
     * @notice Update VRF configuration
     */
    function setVRFConfig(
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) external onlyOwner {
        keyHash = _keyHash;
        vrfSubscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
    }

    /**
     * @notice Toggle quick deals
     */
    function setQuickDealsEnabled(bool _enabled) external onlyOwner {
        quickDealsEnabled = _enabled;
    }

    /**
     * @notice Update quick deal discount
     */
    function setQuickDealDiscount(uint256 _quantity, uint256 _discountBps) external onlyOwner {
        quickDealDiscounts[_quantity] = _discountBps;
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw stuck USDC (only non-player funds)
     */
    function emergencyWithdraw(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        // Only allow withdrawal of funds that are not part of active pots
        uint256 availableBalance = usdcToken.balanceOf(address(this));
        uint256 activePots = draws[currentDrawId].mainPot + draws[currentDrawId].bonusPot;
        require(availableBalance >= activePots + _amount, "Insufficient available balance");
        
        usdcToken.safeTransfer(_to, _amount);
    }
}

