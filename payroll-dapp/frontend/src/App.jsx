import React from 'react';
import ConnectWallet from './components/ConnectWallet';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import Dashboard from './components/Dashboard';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getUserRole } from './utils/getUserRole';

function useRole() {
  const [role, setRole] = useState('guest');
  const [address, setAddress] = useState(null);

  useEffect(() => {
    async function fetchRole() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const r = await getUserRole(accounts[0], provider);
          setRole(r);
        }
      }
    }
    fetchRole();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => fetchRole());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', fetchRole);
      }
    };
  }, []);
  return role;
}

export default function App() {
  const role = useRole();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <header className="p-6 flex justify-between items-center bg-white shadow">
        <h1 className="text-3xl font-bold text-purple-700">Payroll DApp</h1>
        <ConnectWallet />
      </header>
      <main className="p-8 max-w-4xl mx-auto">
        {role === 'admin' ? <AdminDashboard /> : role === 'employee' ? <EmployeeDashboard /> : <Dashboard />}
      </main>
    </div>
  );
}
