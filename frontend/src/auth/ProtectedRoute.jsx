import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Usage:
// <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
// Omit allowedRole to just require "logged in, any role"
export function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Logged in, but wrong role trying to access this page
    return <Navigate to="/login" replace />;
  }

  return children;
}
