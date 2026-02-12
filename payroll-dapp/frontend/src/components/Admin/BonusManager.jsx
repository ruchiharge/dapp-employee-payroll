import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getPayrollContract } from '../../contract/payrollSystem';

export default function BonusManager({ provider }) {
  const [pool, setPool] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  async function distributeBonus() {
    if (!pool || parseFloat(pool) <= 0) {
      setMessage("Please enter a valid bonus amount");
      setMessageType("error");
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      
      const tx = await contract.distributeBonus(ethers.parseEther(pool));
      await tx.wait();
      
      setMessage(`Bonus of ${pool} ETH distributed successfully to all employees!`);
      setMessageType('success');
      setPool('');
    } catch (err) {
      console.error(err);
      setMessage(err.reason || err.message || 'Transaction failed');
      setMessageType('error');
    }
    
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-lg p-8 border border-amber-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg p-3 shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Bonus Distribution</h3>
          <p className="text-sm text-gray-600">Reward your team with performance bonuses</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          messageType === "success" 
            ? "bg-green-100 border-green-500 text-green-800" 
            : "bg-red-100 border-red-500 text-red-800"
        }`}>
          <div className="flex items-start gap-3">
            {messageType === "success" ? (
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div>
              <p className="font-semibold">{messageType === "success" ? "Success!" : "Error"}</p>
              <p className="text-sm mt-0.5">{message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 border border-amber-100 shadow-sm">
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Bonus Pool Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              className="w-full border-2 border-gray-300 rounded-lg pl-12 pr-16 py-3 focus:border-amber-500 focus:outline-none transition-colors text-lg font-semibold"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              value={pool}
              onChange={(e) => setPool(e.target.value)}
            />
            <span className="absolute right-4 top-3.5 text-gray-600 font-bold text-sm">ETH</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Enter the total bonus amount to be split among employees
          </p>
        </div>
     
        <button
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
          onClick={distributeBonus}
          disabled={loading || !pool || parseFloat(pool) <= 0}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Distribute Bonus
            </>
          )}
        </button>
      </div>

    </div>
  );
}