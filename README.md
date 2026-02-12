# Blockchain Payroll Management DApp

## **Group Members**

| Name               | ID             |
|-------------------|----------------|
| Tejasvini Goel    | 2022A7PS1672H  |
| Simran Sesha Rao  | 2022A7PS0002H  |
| Simran Singh      | 2022A7PS0003H  |
| Ruchi Harge       | 2022B4A70942H  |

## **Introduction**
A decentralized payroll system built with **Hardhat 3 Beta** and **React**. This DApp allows an administrator to manage employees, process salary payments in ETH, and distribute performance bonuses via a smart contract.

##  Key Functionalities

### 1\. Employee Management

  * **Add Employee:** Register new employees on the blockchain with their Wallet Address, Name, Salary (in ETH), and Role.
  * **Remove Employee:** Offboard employees and remove them from the payroll list.
  * **Role Management:** Local storage integration to persist roles (Intern, Engineer, Manager, HR, etc.) alongside on-chain data.
  * **Live Dashboard:** View real-time data including wallet balances, last payment timestamps, and current salary tiers.
  * **Sorting:** Sort the employee list by Name, Salary, or Balance.

### 2\. Salary Disbursement

  * **Individual Payment:** Release salary to a specific employee by wallet address.
  * **Bulk Payment:** "Release All" function to pay the entire team in a single transaction (iterates through the array on-chain).
  * **Status Tracking:** Visual indicators for successful transfers.

### 3\. Bonus Distribution

  * **Bonus Pool:** An amber-themed interface to allocate a lump sum of ETH.
  * **Equal Distribution:** The smart contract automatically divides the entered amount equally among all registered employees.

-----

##  Tech Stack & Dependencies

  * **Smart Contract:** Solidity, Hardhat 3 Beta (Minimal setup).
  * **Frontend:** React.js.
  * **Blockchain Interaction:** Ethers.js (v6).
  * **Styling:** Tailwind CSS (Utility-first styling).
  * **Icons:** Inline SVG (Heroicons style).

-----

## Execution Instructions

Follow these steps strictly to set up the local blockchain and connect the frontend.

### Prerequisites

  * Node.js installed.
  * MetaMask extension installed in your browser.

### Step 1: Start the Local Blockchain

Open **Terminal 1** and run the local Hardhat node. This simulates the Ethereum network.

```bash
npx hardhat node
```

*Keep this terminal running at all times.*

### Step 2: Deploy the Smart Contract

Open **Terminal 2**. Deploy the contract to your local network.

```bash
npx hardhat run scripts/deploy.js --network localhost
```

**Important:** Copy the deployed contract address (e.g., `0x5Fb...`) from the terminal output.

### Step 3: Configure the Frontend

You need to link the frontend to your specific blockchain instance.

**A. Update Contract Address**

1.  Go to `payroll-dapp/frontend/src/contract/payrollSystem.js`.
2.  Update the `PAYROLL_CONTRACT_ADDRESS` constant with the address you copied in Step 2.

**B. Update ABI (Crucial Step)**

1.  Navigate to `payroll-dapp/artifacts/contracts/PayrollDPoS.sol/PayrollDPoS.json`.
2.  Open the file and find the `"abi": [...]` section.
3.  Copy the **entire array** inside `abi` (including the square brackets `[]`).
4.  Go to `payroll-dapp/frontend/src/contract/PayrollSystemABI.json`.
5.  Paste the content there.
      * *Note: This fixes "function not found" errors ensuring the frontend knows the exact methods available on your contract.*

**C. Configure Admin Wallet**

1.  Look at the output in **Terminal 1**. Copy the **Private Key** of `Account #0`.
2.  Paste this private key into `payroll-dapp/frontend/src/contract/payrollSystem.js` (where indicated for signer configuration).

### Step 4: Reset MetaMask

Since the local blockchain resets to "Block 0" every time you restart the node, MetaMask gets confused by the nonce history.

1.  Open MetaMask.
2.  Click the Network dropdown and select **Localhost 8545**.
3.  Click your profile icon (top right) \> **Settings** \> **Advanced**.
4.  Click **Clear activity tab data** (or "Reset Account").
5.  *This creates a clean slate for the new session.*

### Step 5: Launch the Application

Open **Terminal 3** and start the React development server.

```bash
cd frontend
npm run dev
```

Open the localhost link provided (usually `http://localhost:5173`) in your browser.

-----

## Project Structure

```
/payroll-dapp
├── artifacts/              # Compiled smart contract ABIs
├── contracts/              # Solidity smart contracts (PayrollDPoS.sol)
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Components (EmployeeManager, BonusManager, SalaryManager)
│   │   ├── contract/       # Configuration (Address, ABI, Ethers setup)
│   │   └── App.jsx         # Main entry point
├── scripts/                # Deployment scripts
└── hardhat.config.js       # Hardhat configuration
```


