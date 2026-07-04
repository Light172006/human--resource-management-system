import { getTable } from "./seedDatabase";

// Simulates network delay so loading states actually get exercised/testable
const fakeDelay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export async function login(email, password) {
  await fakeDelay();

  const users = getTable("users");
  const matchedUser = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!matchedUser) {
    throw new Error("Invalid credentials");
  }

  const token = `mock-jwt-${matchedUser.id}`;
  const user = {
    id: matchedUser.id,
    name: matchedUser.name,
    role: matchedUser.role,
    email: matchedUser.email,
  };

  return { token, user };
}

export function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export async function getProfile(employeeId) {
  await fakeDelay();
  const users = getTable("users");
  const user = users.find((u) => u.id === employeeId);
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateProfile(employeeId, updates) {
  await fakeDelay();
  const users = getTable("users");
  const index = users.findIndex((u) => u.id === employeeId);
  if (index === -1) throw new Error("User not found");

  users[index] = { ...users[index], ...updates };
  localStorage.setItem("db_users", JSON.stringify(users));
  return users[index];
}
