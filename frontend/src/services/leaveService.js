import { getTable, setTable } from "./seedDatabase";

const fakeDelay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

function generateId() {
  return "leave" + Math.random().toString(36).slice(2, 8);
}

export async function applyLeave(employeeId, { type, startDate, endDate, remarks }) {
  await fakeDelay();

  const users = getTable("users");
  const user = users.find((u) => u.id === employeeId);
  if (!user) throw new Error("User not found");

  const newLeave = {
    id: generateId(),
    employeeId,
    type,
    startDate,
    endDate,
    remarks,
    status: "pending",
  };

  // employee-scoped table
  const leave = getTable("leave");
  leave[employeeId] = [...(leave[employeeId] || []), newLeave];
  setTable("leave", leave);

  // admin-scoped "all" table
  const leaveAll = getTable("leaveAll") || [];
  leaveAll.push({ ...newLeave, employeeName: user.name });
  setTable("leaveAll", leaveAll);

  return newLeave;
}

export async function getLeaveByEmployee(employeeId) {
  await fakeDelay();
  const leave = getTable("leave");
  return leave[employeeId] || [];
}

export async function getAllLeave() {
  await fakeDelay();
  return getTable("leaveAll") || [];
}

export async function approveLeave(leaveId, comment = "") {
  return updateLeaveStatus(leaveId, "approved", comment);
}

export async function rejectLeave(leaveId, comment = "") {
  return updateLeaveStatus(leaveId, "rejected", comment);
}

async function updateLeaveStatus(leaveId, status, comment) {
  await fakeDelay();

  // update in leaveAll (admin view)
  const leaveAll = getTable("leaveAll") || [];
  const allIndex = leaveAll.findIndex((l) => l.id === leaveId);
  if (allIndex === -1) throw new Error("Leave request not found");

  leaveAll[allIndex].status = status;
  leaveAll[allIndex].comment = comment;
  setTable("leaveAll", leaveAll);

  // update in the employee-scoped table too, so employee sees the update
  const employeeId = leaveAll[allIndex].employeeId;
  const leave = getTable("leave");
  const employeeRecords = leave[employeeId] || [];
  const empIndex = employeeRecords.findIndex((l) => l.id === leaveId);

  if (empIndex >= 0) {
    employeeRecords[empIndex].status = status;
    employeeRecords[empIndex].comment = comment;
    leave[employeeId] = employeeRecords;
    setTable("leave", leave);
  }

  return { id: leaveId, status };
}
