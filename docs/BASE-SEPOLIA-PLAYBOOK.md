# AUREUS Testnet Playbook (Base Sepolia)

This guide explains how anyone can play the live testnet version of AUREUS using the newly deployed smart contract (`0xe94cFa075B46966e17Ad3Fc6d0676Eb9552ECEc6`).

## 1. Wallet & Network

1. Install MetaMask (mobile or desktop).
2. Add the **Base Sepolia** network:
   - Network name: `Base Sepolia`
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency: `ETH`
   - Explorer: `https://sepolia.basescan.org`
3. Switch MetaMask to Base Sepolia.

## 2. Fund Your Wallet

You need **two** tokens:

| Token | Purpose | Faucet |
|-------|---------|--------|
| ETH (Base Sepolia) | Gas fees | https://faucet.quicknode.com/base/sepolia or https://www.alchemy.com/faucets/base-sepolia |
| USDC (Base Sepolia) | Tickets | Use https://www.coinbase.com/faucets or swap from ETH via https://sepolia.basescan.org token page (mint) |

Add USDC as a custom token if it is not visible:

- Address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Decimals: `6`
- Symbol: `USDC`

## 3. Connect to AUREUS

1. Open the AUREUS web app (desktop or mobile browser).
2. Switch the **mode toggle** (top right) to **Live • Base Sepolia**.
3. Click **Connect Wallet** and approve MetaMask.  
   The UI will sync on-chain data (jackpot, bonus pot, your balance, ticket count).

## 4. Buying Tickets

1. Click **Buy Tickets**.
2. Choose the number of tickets (1 USDC each, with the same quick-buy deals as the contract).
3. Pay with **USDC Wallet** (card payments remain demo-only for now).
4. MetaMask will request:
   - `approve` transaction (first purchase only)
   - `buyTickets` transaction
5. Once confirmed, the modal displays a BaseScan link for the transaction and the UI refreshes automatically.

## 5. Draws & Automation

- The contract is wired to Chainlink VRF v2.5.  
- Daily schedule (UTC):
  - **21:00**: `requestMainDraw`
  - **21:30**: `requestBonusDraw`
- Temporary manual buttons for admins (deployer wallet `0x47d918C2e303855da1AD3e08A4128211284aD837`) are available in the UI under “Admin Controls”.

## 6. Payouts & Claims

- Winners are paid automatically in USDC.  
- If a transfer fails (e.g. wallet restrictions), the amount appears as `pendingClaim`.  
- Claims can be triggered via the DApp (coming soon) or directly with `claim(drawId, drawType)` in Etherscan.

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| `insufficient funds for intrinsic gas` | Get more Base Sepolia ETH (0.02 is enough for many txs). |
| `allowance` error when buying | Approve a larger USDC amount (MetaMask prompt). |
| Wallet stuck on another chain | In MetaMask > Networks choose **Base Sepolia** manually. |
| Faucet empty | Wait a few minutes or switch between QuickNode / Alchemy / Chainlink faucets. |

## 8. Mainnet Launch Checklist

1. Replace Base Sepolia RPC + contract addresses with Base mainnet.
2. Verify contract on BaseScan with API key.
3. Point the DApp’s `.env` to mainnet.
4. Disable demo mode globally.
5. Re-run end-to-end tests (ticket purchases, draws, payouts).

Keep this document updated as we add new funding sources, wallets, or automation tools.*** End Patch

