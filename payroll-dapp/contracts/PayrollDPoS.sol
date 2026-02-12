
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PayrollDPoS {
    address public admin;

    struct Employee {
        address wallet;
        string name;
        uint256 salary;
        uint256 lastPaid;
        bool exists;
    }

    mapping(address => Employee) public employees;
    address[] private employeeList;

    mapping(address => mapping(uint256 => uint256)) private votesReceived;
    mapping(address => mapping(uint256 => bool)) private hasVoted;

    uint256 public currentPeriodId = 1;
    bool private locked;

    /* ========== EVENTS ========== */
    event EmployeeAdded(address indexed wallet, string name, uint256 salary);
    event EmployeeRemoved(address indexed wallet);
    event SalaryReleased(address indexed to, uint256 amount, uint256 timestamp);
    event BatchSalaryReleased(uint256 totalAmount, uint256 timestamp);

    event VoteCast(address indexed from, address indexed to, uint256 periodId);

    event BonusPaid(address indexed to, uint256 amount, uint256 periodId, uint256 timestamp);

    // NEW global-event for entire bonus round
    event BonusDistributed(uint256 periodId, uint256 totalPool, uint256 timestamp);

    event Deposit(address indexed from, uint256 amount);
    event AdminWithdraw(address indexed to, uint256 amount);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    /* ========== MODIFIERS ========== */

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrant");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        admin = msg.sender;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /* ========== EMPLOYEE MGMT ========== */

    function addEmployee(address _wallet, string calldata _name, uint256 _salary)
        external
        onlyAdmin
    {
        require(!employees[_wallet].exists, "Exists");

        employees[_wallet] = Employee({
            wallet: _wallet,
            name: _name,
            salary: _salary,
            lastPaid: 0,
            exists: true
        });

        employeeList.push(_wallet);

        emit EmployeeAdded(_wallet, _name, _salary);
    }

    function removeEmployee(address _wallet) external onlyAdmin {
        require(employees[_wallet].exists, "Not found");

        delete employees[_wallet];

        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employeeList[i] == _wallet) {
                employeeList[i] = employeeList[employeeList.length - 1];
                employeeList.pop();
                break;
            }
        }

        emit EmployeeRemoved(_wallet);
    }

    /* ========== TREASURY ========== */

    function depositFunds() external payable {
        require(msg.value > 0, "No value");
        emit Deposit(msg.sender, msg.value);
    }

    function adminWithdraw(uint256 _amount) external onlyAdmin nonReentrant {
        require(address(this).balance >= _amount, "Insufficient balance");

        (bool ok, ) = payable(admin).call{value: _amount}("");
        require(ok, "Withdraw failed");

        emit AdminWithdraw(admin, _amount);
    }

    /* ========== SALARY ========== */

    function releaseSalary(address _wallet) public onlyAdmin nonReentrant {
        Employee storage emp = employees[_wallet];
        require(emp.exists, "Not found");
        require(address(this).balance >= emp.salary, "Insufficient funds");
        require(emp.lastPaid == 0 || block.timestamp >= emp.lastPaid + 30 days, "Paid recently");

        emp.lastPaid = block.timestamp;

        payable(emp.wallet).transfer(emp.salary);

        emit SalaryReleased(emp.wallet, emp.salary, block.timestamp);
    }

    function releaseAllSalaries() external onlyAdmin nonReentrant {
        uint256 totalPaid = 0;

        for (uint256 i = 0; i < employeeList.length; i++) {
            Employee storage e = employees[employeeList[i]];

            if (e.exists && (e.lastPaid == 0 || block.timestamp >= e.lastPaid + 30 days)) {
                if (address(this).balance >= e.salary) {
                    e.lastPaid = block.timestamp;

                    payable(e.wallet).transfer(e.salary);
                    totalPaid += e.salary;

                    emit SalaryReleased(e.wallet, e.salary, block.timestamp);
                }
            }
        }

        emit BatchSalaryReleased(totalPaid, block.timestamp);
    }

    /* ========== VOTING ========== */

    function vote(address _to) external {
        require(employees[msg.sender].exists && employees[_to].exists, "Invalid");
        require(msg.sender != _to, "Self-vote");
        require(!hasVoted[msg.sender][currentPeriodId], "Already voted");

        hasVoted[msg.sender][currentPeriodId] = true;
        votesReceived[_to][currentPeriodId] += 1;

        emit VoteCast(msg.sender, _to, currentPeriodId);
    }

    /* ========== BONUS DISTRIBUTION (DPoS) ========== */

    function distributeBonus(uint256 _amount) external onlyAdmin nonReentrant {
        require(address(this).balance >= _amount, "Insufficient Treasury");

        uint256 len = employeeList.length;
        require(len > 0, "No employees");

        uint256 totalVotes = 0;
        uint256[] memory votesArr = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            votesArr[i] = votesReceived[employeeList[i]][currentPeriodId];
            totalVotes += votesArr[i];
        }

        if (totalVotes == 0) {
            uint256 share = _amount / len;

            for (uint256 i = 0; i < len; i++) {
                payable(employeeList[i]).transfer(share);
                emit BonusPaid(employeeList[i], share, currentPeriodId, block.timestamp);
            }
        } else {
            for (uint256 i = 0; i < len; i++) {
                if (votesArr[i] > 0) {
                    uint256 share = (votesArr[i] * _amount) / totalVotes;

                    payable(employeeList[i]).transfer(share);
                    emit BonusPaid(employeeList[i], share, currentPeriodId, block.timestamp);
                }
            }
        }

        emit BonusDistributed(currentPeriodId, _amount, block.timestamp);

        currentPeriodId++;
    }

    /* ========== VIEWS ========== */

    function getAllEmployees() external view returns (address[] memory) {
        return employeeList;
    }

    function getEmployee(address _wallet)
        external
        view
        returns (address, string memory, uint256, uint256, bool)
    {
        Employee memory e = employees[_wallet];
        return (e.wallet, e.name, e.salary, e.lastPaid, e.exists);
    }

    /* ========== ADMIN ========== */

    function changeAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Zero address");

        emit AdminChanged(admin, _newAdmin);
        admin = _newAdmin;
    }
}
