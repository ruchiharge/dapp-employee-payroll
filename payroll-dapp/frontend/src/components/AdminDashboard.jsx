import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { getPayrollContract } from '../contract/payrollSystem';
import Leaderboard from "./Admin/LeaderBoard";
import EmployeeManagerWithList from './Admin/EmployeeManagerWithList';

import SalaryManager from './Admin/SalaryManager';
import BonusManager from './Admin/BonusManager';
import AdminActions from './Admin/AdminActions';
import TransactionHistory from './TransactionHistory';
import WalletInfo from './WalletInfo';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("deposit"); 
  const [depositVal, setDepositVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);

  const provider = useMemo(() => {
    if (window.ethereum) return new ethers.BrowserProvider(window.ethereum);
    return null;
  }, []);

  useEffect(() => {
    async function fetchAccount() {
      if (provider) {
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
      }
    }
    fetchAccount();
  }, [provider]);

  async function handleDeposit() {
    if (!depositVal || !provider) return;
    setLoading(true);

    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      const tx = await contract.depositFunds({
        value: ethers.parseEther(depositVal),
      });

      await tx.wait();
      alert(`Successfully deposited ${depositVal} ETH!`);
      setDepositVal('');
    } catch (err) {
      alert("Deposit failed: " + (err.reason || err.message));
    }

    setLoading(false);
  }


  const tabs = [
     { id: "deposit", label: "Overview" },
    { id: "employees", label: "Employee Manager" },
    { id: "salary", label: "Salary Management" },
    { id: "admin", label: "Admin Actions" },
    { id: "history", label: "Transaction History" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">Admin Dashboard</h2>

      {account && (
        <div className="mb-6">
          <WalletInfo provider={provider} account={account} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b pb-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-md font-semibold text-sm transition 
              ${activeTab === tab.id
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">

        {activeTab === "employees" && (
                   <div className="space-y-6">
            <EmployeeManagerWithList provider={provider} />
          </div>

        )}

        {activeTab === "salary" && (
           <div className="space-y-6">
            <SalaryManager provider={provider} />
            <BonusManager provider={provider} />
          </div>
        )}

     
{activeTab === "deposit" && (
  <div>

    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-bold text-blue-700 text-lg mb-3">💰 Deposit Funds</h3>

      <div className="flex gap-3">
        <input
          type="number"
          value={depositVal}
          onChange={(e) => setDepositVal(e.target.value)}
          placeholder="Amount (ETH)"
          className="border border-blue-300 p-2 rounded w-full max-w-xs"
        />

        <button
          onClick={handleDeposit}
          disabled={loading}
          className={`px-6 py-2 rounded font-semibold text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Depositing..." : "Deposit"}
        </button>
      </div>
    </div>

    <div className="mt-6">
      <Leaderboard />
    </div>

  </div>
)}


        {activeTab === "admin" && (
          <AdminActions provider={provider} />
        )}

        {activeTab === "history" && (
          <TransactionHistory
            provider={provider}
            role="admin"
            currentAccount={account}
          />
        )}

      </div>
    </div>
  );
}
