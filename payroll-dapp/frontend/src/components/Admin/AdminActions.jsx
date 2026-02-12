import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getPayrollContract } from '../../contract/payrollSystem';

export default function AdminActions({ provider }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleWithdraw() {
    if (!withdrawAmount) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      
      const tx = await contract.adminWithdraw(ethers.parseEther(withdrawAmount));
      await tx.wait();
      
      alert(`Successfully withdrew ${withdrawAmount} ETH back to your wallet.`);
      setWithdrawAmount('');
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.reason || err.message));
    }
    setLoading(false);
  }

  async function handleChangeAdmin() {
    if (!newAdmin) return;
    if (!window.confirm("⚠️ WARNING: If you change the admin, you will lose access to this dashboard immediately. Are you sure?")) return;
    
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      
      const tx = await contract.changeAdmin(newAdmin);
      await tx.wait();
      
      alert("Admin transferred! You are no longer the admin.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.reason || err.message));
    }
    setLoading(false);
  }

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <h3 className="font-bold text-red-800 mb-2">Emergency Withdraw</h3>
        <p className="text-xs text-red-600 mb-3">Retrieve excess funds from the contract.</p>
        <div className="flex gap-2">
          <input 
            className="border border-red-300 p-2 rounded w-full text-sm" 
            placeholder="Amount (ETH)" 
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
          />
          <button 
            onClick={handleWithdraw} 
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 disabled:bg-gray-400"
          >
            Withdraw
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">Transfer Ownership</h3>
        <p className="text-xs text-gray-500 mb-3">Warning: This action is irreversible.</p>
        <div className="flex gap-2">
          <input 
            className="border border-gray-300 p-2 rounded w-full text-sm" 
            placeholder="New Admin Address (0x...)" 
            value={newAdmin}
            onChange={e => setNewAdmin(e.target.value)}
          />
          <button 
            onClick={handleChangeAdmin} 
            disabled={loading}
            className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-900 disabled:bg-gray-400"
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
