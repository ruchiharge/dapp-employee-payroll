import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { PAYROLL_CONTRACT_ADDRESS } from '../contract/payrollSystem';

export default function WalletInfo({ provider, account, showTreasury = true }) {
  const [userBalance, setUserBalance] = useState('0.0');
  const [contractBalance, setContractBalance] = useState('0.0');

  useEffect(() => {
    if (provider && account) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [provider, account]);

  async function fetchBalances() {
    try {
      const uBal = await provider.getBalance(account);
      setUserBalance(ethers.formatEther(uBal));
      
      if (showTreasury) {
        const cBal = await provider.getBalance(PAYROLL_CONTRACT_ADDRESS);
        setContractBalance(ethers.formatEther(cBal));
      }
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">My Wallet</p>
          <p className="text-sm text-gray-400 font-mono truncate w-32">{account}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-800">{parseFloat(userBalance).toFixed(4)}</p>
          <p className="text-xs text-purple-600 font-bold">ETH</p>
        </div>
      </div>

      {showTreasury && (
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Company Treasury</p>
            <p className="text-xs text-blue-500">Available Funds</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">{parseFloat(contractBalance).toFixed(4)}</p>
            <p className="text-xs text-blue-600 font-bold">ETH</p>
          </div>
        </div>
      )}
    </div>
  );
}