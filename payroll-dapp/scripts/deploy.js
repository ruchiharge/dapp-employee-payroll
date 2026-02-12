import hre from "hardhat";

async function main() {
  const PayrollDPoS = await hre.ethers.getContractFactory("PayrollDPoS");

  const payroll = await PayrollDPoS.deploy();

  await payroll.waitForDeployment();

  console.log("Contract deployed to:", payroll.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
