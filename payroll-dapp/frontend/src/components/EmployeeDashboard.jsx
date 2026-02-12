import React, { useEffect, useState, useMemo } from 'react';
import { ethers } from 'ethers';
import { getPayrollContract } from '../contract/payrollSystem';
import TransactionHistory from './TransactionHistory';

export default function EmployeeDashboard() {
  const [account, setAccount] = useState(null);
  const provider = useMemo(() => {
    if (window.ethereum) return new ethers.BrowserProvider(window.ethereum);
    return null;
  }, []);
  const [employee, setEmployee] = useState(null);
  const [empLoading, setEmpLoading] = useState(false);
  const [error, setError] = useState('');

  const [peers, setPeers] = useState([]); 
  const [selectedPeer, setSelectedPeer] = useState('');
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteMsg, setVoteMsg] = useState('');

  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    async function fetchAccount() {
      if (provider) {
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
      }
    }
    fetchAccount();
  }, [provider]);

  useEffect(() => {
    if (provider && account) {
      fetchData();
    }
  }, [provider, account]);

  async function fetchData() {
    setEmpLoading(true);
    setError('');
    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      console.log("Payroll Contract:");
      const data = await contract.getEmployee(account);
      console.log("Employee Data:", data);
      if (data[4] === false) {
        setError("Account not found in Employee List.");
      } else {
        const balance = await provider.getBalance(account);

        setEmployee({
          name: data[1],
          salary: ethers.formatEther(data[2]),
          lastPaid: Number(data[3]),
          wallet: account,
          walletBalance: ethers.formatEther(balance),
        });
      }

      const addresses = await contract.getAllEmployees();
      const peerAddresses = addresses.filter(
        addr => addr.toLowerCase() !== account.toLowerCase()
      );
            
            const empData = [];
            
            for (const addr of peerAddresses) {
              const e = await contract.getEmployee(addr);
              
              empData.push({
                address: e[0],
                name: e[1],
                salary: ethers.formatEther(e[2]),
                lastPaid: Number(e[3]),
              });
            }
            setPeers(empData);

    } catch (err) {
      console.error("Dashboard Error:", err);
      setError("Failed to load data. Check console.");
    } finally {
      setEmpLoading(false);
    }
  }

  async function handleVote() {
    if (!selectedPeer) return;
    setVoteLoading(true);
    setVoteMsg('');

    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      const tx = await contract.vote(selectedPeer);
      await tx.wait();
      setVoteMsg('Vote cast successfully!');
    } catch (err) {
      console.error(err);
      setVoteMsg(' Error: ' + (err.reason || "Transaction failed"));
    }

    setVoteLoading(false);
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex gap-4">
          {["profile", "voting", "history"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-semibold ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tab === "profile" && "Profile"}
              {tab === "voting" && "Peer Voting"}
              {tab === "history" && "Transaction History"}
            </button>
          ))}
        </div>
        {employee?.wallet && (
          <div className="bg-gray-100 px-3 py-1 rounded-lg shadow text-xs font-mono text-gray-700 flex items-center gap-2">
            <span className="font-semibold">Wallet:</span>
            <span title={employee.wallet}>
              {employee.wallet}
            </span>
          </div>
        )}
      </div>
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow p-6 relative">

          <h2 className="text-2xl font-bold text-blue-700 mb-6">Employee Profile</h2>
          
      

          {empLoading ? (
            <p className="text-blue-500 font-bold animate-pulse">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : employee ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              <div className="bg-blue-50 p-4 rounded-lg border">
                <p className="text-xs text-blue-500 uppercase">Name</p>
                <p className="text-lg font-bold">{employee.name}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border">
                <p className="text-xs text-green-500 uppercase">Salary</p>
                <p className="text-lg font-bold">{employee.salary} ETH</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border">
                <p className="text-xs text-purple-500 uppercase">Last Paid</p>
                <p className="text-lg font-bold">
                  {employee.lastPaid === 0
                    ? "Never"
                    : new Date(employee.lastPaid * 1000).toLocaleString()}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border">
                <p className="text-xs text-yellow-500 uppercase">Balance</p>
                <p className="text-lg font-bold"> <strong>{Number(employee.walletBalance).toFixed(2)} ETH</strong>
                </p>
              </div>

            </div>
          ) : null}

        </div>
      )}
      {activeTab === "voting" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Peer Review Voting</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="bg-gray-100 text-xs text-gray-600">
                   <th className="p-2 w-16 text-left">Select</th>
                  <th className="p-2 w-40 text-left">Employee Name</th> 
                  <th className="p-2 text-left">Wallet Address</th>
                </tr>
              </thead>

              <tbody>
                {peers.length === 0 ? (
                  <tr>
                    <td className="text-center p-4" colSpan="3">No employees found.</td>
                  </tr>
                ) : peers.map(peer => (
                  <tr key={peer.address} className="border-b">
                    <td className="p-2 align-middle w-20">
                      <input
                        type="radio"
                        name="peerSelect"
                        value={peer.address}
                        checked={selectedPeer === peer.address}
                        onChange={() => setSelectedPeer(peer.address)}
                        className="mx-auto block"
                      />
                    </td>
                    <td className="p-2 font-mono text-sm align-middle">
                      {peer.name}
                    </td>
                    <td className="p-2 font-mono text-sm align-middle">
                      {peer.address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleVote}
            disabled={!selectedPeer || voteLoading}
            className={`mt-4 px-4 py-2 rounded text-white font-semibold ${
              voteLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {voteLoading ? "Voting..." : "Submit Vote"}
          </button>

          {voteMsg && <p className="mt-2 text-sm">{voteMsg}</p>}
        </div>
      )}
      {activeTab === "history" && (
        <TransactionHistory 
          provider={provider} 
          role="employee" 
          currentAccount={account} 
        />
      )}

    </div>
  );
}
