import { ethers } from 'ethers';
import PayrollSystemABI from './PayrollSystemABI.json';

export const PAYROLL_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export function getPayrollContract(signerOrProvider) {
  return new ethers.Contract(PAYROLL_CONTRACT_ADDRESS, PayrollSystemABI, signerOrProvider);
}
