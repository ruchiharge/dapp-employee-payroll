import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../../contract/PayrollSystemABI.json";
import { PAYROLL_CONTRACT_ADDRESS  as CONTRACT_ADDRESS} from "../../contract/payrollSystem";  

export default function Leaderboard() {
  const [contract, setContract] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [employees, setEmployees] = useState({});

  useEffect(() => {
    async function init() {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
     const signer = await provider.getSigner();
     const payrollContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
);

      setContract(payrollContract);
    }
    init();
  }, []);

  useEffect(() => {
    if (!contract) return;

    async function loadEmployees() {
      const list = await contract.getAllEmployees();
      const empData = {};
      console.log("Employee List for Leaderboard:", list);
      for (const wallet of list) {
        const emp = await contract.getEmployee(wallet);
        empData[wallet] = {
          wallet,
          name: emp[1],
        };
      }
      setEmployees(empData);
    }

    loadEmployees();
  }, [contract]);

  useEffect(() => {
    if (!contract) return;

    async function loadLeaderboard() {
      const filter = contract.filters.VoteCast();
      const events = await contract.queryFilter(filter);

      const voteCounts = {};

      events.forEach((ev) => {
        const votedFor = ev.args.to;
        if (!voteCounts[votedFor]) voteCounts[votedFor] = 0;
        voteCounts[votedFor] += 1;
      });

      const lb = Object.keys(voteCounts).map((addr) => ({
        wallet: addr,
        votes: voteCounts[addr],
        name: employees[addr]?.name || "Unknown",
      }));

      lb.sort((a, b) => b.votes - a.votes);

      setLeaderboard(lb);
    }

    loadLeaderboard();
  }, [contract, employees]);

  return (
    <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-xl font-semibold mb-4">🏆 Leaderboard</h2>

      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-sm">No votes yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-gray-600 text-sm border-b">
              <th className="p-2">Rank</th>
              <th className="p-2">Name</th>
              <th className="p-2">Wallet</th>
              <th className="p-2">Votes</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.map((emp, i) => (
              <tr key={i} className="border-b">
                <td className="p-3 font-bold text-slate-700">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                <td className="p-2">{emp.name}</td>
                <td className="p-2 font-mono text-xs">{emp.wallet}</td>
                <td className="p-2 font-semibold">{emp.votes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
