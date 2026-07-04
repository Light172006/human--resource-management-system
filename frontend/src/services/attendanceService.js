import { getTable, setTable } from "./seedDatabase";

const fakeDelay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5); // "HH:MM"
}

export async function checkIn(employeeId) {
  await fakeDelay();
  const attendance = getTable("attendance");
  const employeeRecords = attendance[employeeId] || [];

  const today = todayStr();
  const existingIndex = employeeRecords.findIndex((r) => r.date === today);

  const record = {
    date: today,
    checkIn: nowTimeStr(),
    checkOut: null,
    status: "present",
  };

  if (existingIndex >= 0) {
    employeeRecords[existingIndex] = { ...employeeRecords[existingIndex], ...record };
  } else {
    employeeRecords.unshift(record);
  }

  attendance[employeeId] = employeeRecords;
  setTable("attendance", attendance);

  // keep the admin "all employees" view roughly in sync for the demo
  syncAttendanceAll(employeeId, today, "present");

  return record;
}

export async function checkOut(employeeId) {
  await fakeDelay();
  const attendance = getTable("attendance");
  const employeeRecords = attendance[employeeId] || [];

  const today = todayStr();
  const existingIndex = employeeRecords.findIndex((r) => r.date === today);

  if (existingIndex === -1) {
    throw new Error("No check-in found for today");
  }

  employeeRecords[existingIndex].checkOut = nowTimeStr();
  attendance[employeeId] = employeeRecords;
  setTable("attendance", attendance);

  return employeeRecords[existingIndex];
}

export async function getAttendance(employeeId) {
  await fakeDelay();
  const attendance = getTable("attendance");
  return attendance[employeeId] || [];
}

export async function getAllAttendance() {
  await fakeDelay();
  return getTable("attendanceAll") || [];
}

function syncAttendanceAll(employeeId, date, status) {
  const users = getTable("users");
  const user = users.find((u) => u.id === employeeId);
  if (!user) return;

  const all = getTable("attendanceAll") || [];
  const index = all.findIndex((r) => r.employeeId === employeeId && r.date === date);

  const entry = { employeeId, name: user.name, date, status };

  if (index >= 0) {
    all[index] = entry;
  } else {
    all.push(entry);
  }

  setTable("attendanceAll", all);
}
