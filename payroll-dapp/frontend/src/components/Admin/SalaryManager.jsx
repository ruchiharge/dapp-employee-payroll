import React, { useState } from "react";
import { getPayrollContract } from "../../contract/payrollSystem";

export default function SalaryManager({ provider }) {
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function releaseSalary() {
    setLoading(true);
    setMessage("");
    try {
      const contract = getPayrollContract(await provider.getSigner());
      const tx = await contract.releaseSalary(wallet);
      await tx.wait();
      setMessage("Salary released successfully!");
      setMessageType("success");
      setWallet("");
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
    setLoading(false);
  }

  async function releaseAllSalaries() {
    setLoading(true);
    setMessage("");
    try {
      const contract = getPayrollContract(await provider.getSigner());
      const tx = await contract.releaseAllSalaries();
      await tx.wait();
      setMessage("All salaries released successfully!");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-8 border border-green-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Salary Payments</h3>
          <p className="text-sm text-gray-600">Release payments to employees</p>
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

      <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h4 className="text-lg font-bold text-gray-800">Individual Payment</h4>
        </div>
        
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Employee Wallet Address
        </label>
        <input
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors font-mono text-sm mb-4"
          placeholder="0x..."
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />

        <button
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={releaseSalary}
          disabled={loading || !wallet}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Release Salary
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-sm font-semibold text-gray-500 uppercase">Or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-800">Batch Payment</h4>
            <p className="text-sm text-gray-600 mt-1">Release salaries to all eligible employees at once</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Caution</p>
            <p className="text-xs text-amber-700 mt-1">This action will release salaries to all employees. Make sure sufficient funds are available.</p>
          </div>
        </div>

        <button
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={releaseAllSalaries}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing All Payments...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Release All Salaries
            </>
          )}
        </button>
      </div>  
    </div>
  );
}