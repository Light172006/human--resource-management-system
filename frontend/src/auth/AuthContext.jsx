import { createContext, useContext, useState } from "react";
import mockData from "../mock/mock-data.json";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Try to restore session on page load
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // TODO: replace this function's body with a real fetch('/api/login') call
  // once P1's backend is ready. Keep the same input/output shape.
  const login = async (email, password) => {
    const matchedUser = mockData.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!matchedUser) {
      throw new Error("Invalid credentials");
    }

    const response = mockData.loginResponses[email];

    setUser(response.user);
    setToken(response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    localStorage.setItem("token", response.token);

    return response.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
