import mockData from "../mock/mock-data.json";

const SEEDED_FLAG = "hrms_seeded";

// Call this once when the app boots (in App.jsx or main.jsx)
export function seedDatabase() {
  const alreadySeeded = localStorage.getItem(SEEDED_FLAG);
  if (alreadySeeded) return;

  localStorage.setItem("db_users", JSON.stringify(mockData.users));
  localStorage.setItem("db_attendance", JSON.stringify(mockData.attendance));
  localStorage.setItem("db_attendanceAll", JSON.stringify(mockData.attendanceAll));
  localStorage.setItem("db_leave", JSON.stringify(mockData.leave));
  localStorage.setItem("db_leaveAll", JSON.stringify(mockData.leaveAll));
  localStorage.setItem("db_payroll", JSON.stringify(mockData.payroll));

  localStorage.setItem(SEEDED_FLAG, "true");
}

// Utility used by all services to read a "table"
export function getTable(tableName) {
  const raw = localStorage.getItem(`db_${tableName}`);
  return raw ? JSON.parse(raw) : null;
}

// Utility used by all services to write a "table"
export function setTable(tableName, data) {
  localStorage.setItem(`db_${tableName}`, JSON.stringify(data));
}

// DEV HELPER: wipe everything and reseed fresh demo data
// Call from browser console if data gets messy during testing: resetDatabase()
export function resetDatabase() {
  localStorage.removeItem(SEEDED_FLAG);
  localStorage.removeItem("db_users");
  localStorage.removeItem("db_attendance");
  localStorage.removeItem("db_attendanceAll");
  localStorage.removeItem("db_leave");
  localStorage.removeItem("db_leaveAll");
  localStorage.removeItem("db_payroll");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  seedDatabase();
  console.log("Database reset and reseeded.");
}

if (typeof window !== "undefined") {
  window.resetDatabase = resetDatabase; // handy for demo-day debugging
}
