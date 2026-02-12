import React, { useState } from 'react';
import { ethers } from 'ethers';

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);

  async function connect() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
      } catch (err) {
        alert('Connection failed: ' + err.message);
      }
    } else {
      alert('MetaMask not detected');
    }
  }

  return account ? (
    <span className="px-4 py-2 bg-purple-100 rounded text-purple-700 font-semibold">{account.slice(0, 6)}...{account.slice(-4)}</span>
  ) : (
    <button className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700" onClick={connect}>
      Connect Wallet
    </button>
  );
}
