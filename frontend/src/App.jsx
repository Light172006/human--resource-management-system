import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
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

          {/* default route -> login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
