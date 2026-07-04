import { getTable, setTable } from "./seedDatabase";

const fakeDelay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// Employee: read-only view of their own payroll
export async function getPayroll(employeeId) {
  await fakeDelay();

  const payroll = getTable("payroll");
  const record = payroll[employeeId];

  if (!record) {
    throw new Error("Payroll record not found");
  }

  return record;
}

// Admin: view any employee's payroll (same as above, kept separate for clarity/contract match)
export async function getPayrollAsAdmin(employeeId) {
  return getPayroll(employeeId);
}

// Admin: update salary structure for an employee
export async function updatePayroll(employeeId, { basic, hra, allowances }) {
  await fakeDelay();

  const payroll = getTable("payroll");
  const existing = payroll[employeeId];

  if (!existing) {
    throw new Error("Payroll record not found");
  }

  const updated = {
    employeeId,
    basic: basic ?? existing.basic,
    hra: hra ?? existing.hra,
    allowances: allowances ?? existing.allowances,
  };
  updated.total = updated.basic + updated.hra + updated.allowances;

  payroll[employeeId] = updated;
  setTable("payroll", payroll);

  return updated;
}

// Admin: get payroll for all employees (handy for a payroll table view)
export async function getAllPayroll() {
  await fakeDelay();

  const payroll = getTable("payroll");
  const users = getTable("users");

  return Object.values(payroll).map((record) => {
    const user = users.find((u) => u.id === record.employeeId);
    return { ...record, employeeName: user ? user.name : "Unknown" };
  });
}
