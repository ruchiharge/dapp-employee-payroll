import { ethers } from 'ethers';
import { getPayrollContract } from '../contract/payrollSystem';

export async function getUserRole(address, provider) {
  try {
    const signer = await provider.getSigner();
    const contract = getPayrollContract(signer);

    const admin = await contract.admin();
    if (admin.toLowerCase() === address.toLowerCase()) {
      return 'admin';
    }

    const employeeData = await contract.getEmployee(address);
    
    if (employeeData[4] === true) {
      return 'employee';
    }

    return 'guest';
  } catch (err) {
    console.error("Error checking role:", err);
    return 'guest';
  }
}
