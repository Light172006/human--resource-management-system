import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { seedDatabase } from "./services/seedDatabase";

import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Add this temporarily near the top of App.jsx, remove before demo
import * as authService from "./services/authService";
import * as attendanceService from "./services/attendanceService";
import * as leaveService from "./services/leaveService";
import * as payrollService from "./services/payrollService";

window.authService = authService;
window.attendanceService = attendanceService;
window.leaveService = leaveService;
window.payrollService = payrollService;

export default function App() {
  useEffect(() => {
    seedDatabase(); // runs once, only seeds if localStorage is empty
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
