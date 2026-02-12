import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getPayrollContract } from "../../contract/payrollSystem";

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 13l-1 1-3-3 3-3 1 1 3.743-3.743A6 6 0 1118 8zm-6.5 1a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" /></svg>;
const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" /></svg>;
const Spinner = () => <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function EmployeeManagerWithList({ provider }) {
  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [role, setRole] = useState("Intern");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 
  const [employees, setEmployees] = useState([]);
  
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); 

  const saveRole = (wallet, role) => {
    const roles = JSON.parse(localStorage.getItem("employeeRoles") || "{}");
    roles[wallet.toLowerCase()] = role;
    localStorage.setItem("employeeRoles", JSON.stringify(roles));
  };

  const getRole = (wallet) => {
    const roles = JSON.parse(localStorage.getItem("employeeRoles") || "{}");
    return roles[wallet.toLowerCase()] || "Not Set";
  };

  async function addEmployee() {
    if(!wallet || !name || !salary) {
      setMessage("All fields required.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      const tx = await contract.addEmployee(wallet, name, ethers.parseEther(salary));
      await tx.wait();
      saveRole(wallet, role);
      setMessage("Added!");
      setMessageType("success");
      setWallet(""); setName(""); setSalary("");
      fetchEmployees();
    } catch (err) {
      setMessage("Error: " + (err.reason || err.message));
      setMessageType("error");
    }
    setLoading(false);
  }

  async function removeEmployee(targetWallet = null) {
    const addressToRemove = targetWallet || wallet;
    if(!addressToRemove) {
        setMessage("Wallet address required.");
        setMessageType("error");
        return;
    }
    setLoading(true);
    setMessage("");
    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      const tx = await contract.removeEmployee(addressToRemove);
      await tx.wait();
      const roles = JSON.parse(localStorage.getItem("employeeRoles") || "{}");
      delete roles[addressToRemove.toLowerCase()];
      localStorage.setItem("employeeRoles", JSON.stringify(roles));
      setMessage("Removed!");
      setMessageType("success");
      fetchEmployees();
    } catch (err) {
      setMessage("Error: " + (err.reason || err.message));
      setMessageType("error");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (provider) fetchEmployees();
  }, [provider]);

  async function fetchEmployees() {
    if (!provider) return;
    try {
      const signer = await provider.getSigner();
      const contract = getPayrollContract(signer);
      const addresses = await contract.getAllEmployees();
      const empData = [];
      for (const addr of addresses) {
        const e = await contract.getEmployee(addr);
        empData.push({
          wallet: e[0],
          name: e[1],
          salary: ethers.formatEther(e[2]),
          lastPaid: Number(e[3]),
          balance: Number(ethers.formatEther(await provider.getBalance(addr))).toFixed(3),
          role: getRole(e[0]), 
        });
      }
      setEmployees(empData);
    } catch (err) {
      console.error("Error loading list:", err);
    }
  }

   function sortBy(field) {
    let direction = sortOrder === "asc" ? "desc" : "asc";
    if(sortField !== field) direction = 'asc';
    setSortOrder(direction);
    setSortField(field);
    const sorted = [...employees].sort((a, b) => {
      if (field === "name") return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      else return direction === "asc" ? a[field] - b[field] : b[field] - a[field];
    });
    setEmployees(sorted);
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1 text-[10px]">↕</span>;
    return sortOrder === "asc" ? <span className="text-purple-600 ml-1 text-[10px]">↑</span> : <span className="text-purple-600 ml-1 text-[10px]">↓</span>;
  };

  const getRoleBadgeColor = (roleName) => {
    switch(roleName) {
      case 'Manager': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Senior Engineer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Junior Engineer': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Intern': return 'bg-green-100 text-green-800 border-green-200';
      case 'HR': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-2 space-y-3"> 
      
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <div>
            <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">
              Payroll Dashboard
            </h2>
        </div>
        {message && (
            <div className={`px-3 py-1 rounded text-xs font-medium ${
                messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
            {message}
            </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4"> 
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                
                <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Wallet</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><WalletIcon /></div>
                        <input
                            className="w-full pl-8 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            placeholder="0x..."
                            value={wallet}
                            onChange={(e) => setWallet(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><UserIcon /></div>
                        <input
                            className="w-full pl-8 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="space-y-0.5 flex-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Role</label>
                        <select
                            className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 transition-all"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="Intern">Intern</option>
                            <option value="Junior Engineer">Jr. Eng</option>
                            <option value="Senior Engineer">Sr. Eng</option>
                            <option value="Team Lead">Lead</option>
                            <option value="Manager">Manager</option>
                            <option value="HR">HR</option>
                        </select>
                    </div>
                    <div className="space-y-0.5 flex-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Salary</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><CashIcon /></div>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full pl-7 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                placeholder="0.00"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1.5 px-3 rounded shadow-sm transition-colors flex justify-center items-center gap-1 disabled:opacity-50"
                        onClick={addEmployee}
                        disabled={loading}
                    >
                        {loading ? <Spinner /> : "Add"}
                    </button>
                    <button
                        className="w-auto text-red-500 hover:bg-red-50 border border-red-100 text-sm font-medium py-1.5 px-3 rounded transition-all disabled:opacity-50"
                        onClick={() => removeEmployee()}
                        disabled={loading || !wallet}
                        title="Remove address in input"
                    >
                       Remove
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700 text-sm">Team ({employees.length})</h3>
          <button
            onClick={fetchEmployees}
            className="text-[10px] font-bold uppercase text-purple-600 hover:text-purple-800 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-white text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-200">
              <th className="px-3 py-2 font-bold">Wallet</th>
              <th className="px-3 py-2 font-bold cursor-pointer hover:text-purple-700" onClick={() => sortBy("name")}>Name <SortIcon field="name" /></th>
              <th className="px-3 py-2 font-bold cursor-pointer hover:text-purple-700" onClick={() => sortBy("salary")}>Salary <SortIcon field="salary" /></th>
              <th className="px-3 py-2 font-bold">Last Paid</th>
              <th className="px-3 py-2 font-bold">Role</th>
              <th className="px-3 py-2 font-bold cursor-pointer hover:text-purple-700" onClick={() => sortBy("balance")}>Bal <SortIcon field="balance" /></th>
              <th className="px-3 py-2 font-bold text-right"></th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {employees.length === 0 && !loading && (
                 <tr><td colSpan="7" className="text-center py-6 text-gray-400 italic text-xs">No employees found.</td></tr>
              )}

              {employees.map((e, i) => (
                <tr key={i} className="hover:bg-purple-50/50 transition-colors group">
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">{e.wallet.slice(0, 6)}...{e.wallet.slice(-4)}</td>
                  <td className="px-3 py-2 text-gray-800 font-medium">{e.name}</td>
                  <td className="px-3 py-2 font-mono font-bold text-gray-700">{e.salary}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {e.lastPaid === 0 ? "Never" : new Date(e.lastPaid * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeColor(e.role)}`}>{e.role}</span>
                  </td>
                  <td className="px-3 py-2 text-blue-600 text-xs font-medium">{e.balance}</td>
                  <td className="px-3 py-2 text-right">
                      <button 
                        onClick={() => { if(window.confirm(`Remove ${e.name}?`)) removeEmployee(e.wallet) }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                          <TrashIcon />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}