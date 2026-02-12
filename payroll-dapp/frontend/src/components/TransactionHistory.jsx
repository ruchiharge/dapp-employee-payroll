import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getPayrollContract } from '../contract/payrollSystem';

export default function TransactionHistory({ provider, role, currentAccount }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(''); 

  useEffect(() => {
    if (provider) fetchHistory();
  }, [provider, currentAccount]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const contract = getPayrollContract(await provider.getSigner());
      const salaryFilter = contract.filters.SalaryReleased();
      const bonusPaidFilter = contract.filters.BonusPaid ? contract.filters.BonusPaid() : null;
      const bonusDistributedFilter = contract.filters.BonusDistributed ? contract.filters.BonusDistributed() : null;
      const depositFilter = contract.filters.Deposit();
      const withdrawFilter = contract.filters.AdminWithdraw();

      const promises = [
        contract.queryFilter(salaryFilter),
        bonusPaidFilter ? contract.queryFilter(bonusPaidFilter) : Promise.resolve([]),
        bonusDistributedFilter ? contract.queryFilter(bonusDistributedFilter) : Promise.resolve([]),
        contract.queryFilter(depositFilter),
        contract.queryFilter(withdrawFilter)
      ];
      const [salaries, bonusPaid, bonusDistributed, deposits, withdraws] = await Promise.all(promises);

      async function getBlockTimestamp(blockNumber) {
        const block = await provider.getBlock(blockNumber);
        return block.timestamp;
      }

      const formatTx = async (event, type) => {
        let to = event.args[0];
        let amount = event.args[1];
        let timestamp;
        if (type === 'Salary' || type === 'Bonus') {
          timestamp = event.args[event.args.length - 1];
        } else {
          timestamp = await getBlockTimestamp(event.blockNumber);
        }
        return {
          type,
          to,
          amount: ethers.formatEther(amount),
          timestamp: Number(timestamp),
          block: event.blockNumber,
        };
      };

      const allSalaries = await Promise.all(salaries.map(e => formatTx(e, 'Salary')));
      const allBonusPaid = await Promise.all(bonusPaid.map(e => formatTx(e, 'Bonus')));
      const allBonusDistributed = await Promise.all(bonusDistributed.map(async (event) => {
        const timestamp = await getBlockTimestamp(event.blockNumber);
        return {
          type: 'BonusDistributed',
          to: '-',
          amount: ethers.formatEther(event.args[1]),
          periodId: event.args[0].toString(),
          timestamp: Number(timestamp),
          block: event.blockNumber,
        };
      }));
      const allDeposits = await Promise.all(deposits.map(e => formatTx(e, 'Deposit')));
      const allWithdraws = await Promise.all(withdraws.map(e => formatTx(e, 'Withdraw')));

      let allTx = [...allSalaries, ...allBonusPaid, ...allBonusDistributed, ...allDeposits, ...allWithdraws];

      if (role === 'employee' && currentAccount) {
        allTx = allTx.filter(tx => tx.to.toLowerCase() === currentAccount.toLowerCase());
      }
      allTx.sort((a, b) => b.block - a.block);
      setTransactions(allTx);
    } catch (err) {
      console.error("History Error:", err);
    }
    setLoading(false);
  }

  const displayedTransactions = transactions.filter(tx => {
    if (role === 'admin' && filter) {
      return tx.to.toLowerCase().includes(filter.toLowerCase());
    }
    return true;
  });

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-bold text-gray-800">
          {role === 'admin' ? 'Global Transaction History' : 'My Payment History'}
        </h3>
        
        {role === 'admin' && (
          <input 
            type="text" 
            placeholder="Filter by Wallet (0x...)" 
            className="border p-2 rounded text-sm w-full sm:w-64"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        )}
        
        <button onClick={fetchHistory} className="text-sm text-blue-600 hover:underline whitespace-nowrap">
          Refresh Data
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-sm text-gray-600">
              <th className="p-3">Type</th>
              <th className="p-3">{role === 'admin' ? 'Recipient/Period' : 'Status'}</th>
              <th className="p-3">Amount</th>
              <th className="p-3 hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr> : 
             displayedTransactions.length === 0 ? <tr><td colSpan="4" className="p-4 text-center text-gray-500">No transactions found.</td></tr> :
             displayedTransactions.map((tx, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold 
                      ${tx.type === 'Salary' ? 'bg-green-100 text-green-800' : ''}
                      ${tx.type === 'Bonus' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${tx.type === 'BonusDistributed' ? 'bg-purple-100 text-purple-800' : ''}
                      ${tx.type === 'Deposit' ? 'bg-blue-100 text-blue-800' : ''}
                      ${tx.type === 'Withdraw' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {tx.type === 'BonusDistributed' ? 'Bonus Pool' : tx.type}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-mono text-gray-600">
                    {tx.type === 'BonusDistributed' ? `Period #${tx.periodId}` : (role === 'admin' ? `${tx.to.slice(0,6)}...${tx.to.slice(-4)}` : 'Received')}
                  </td>
                  <td className="p-3 font-bold text-gray-800">{tx.amount} ETH</td>
                  <td className="p-3 text-xs text-gray-500 hidden sm:table-cell">
                    {new Date(tx.timestamp * 1000).toLocaleDateString()}
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}