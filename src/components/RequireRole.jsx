//src/components/RequireRole.jsx
// UI-only guard, the backend enforces the real permission check.

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function RequireRole({ role, children }) {
  const { user } = useContext(UserContext);
  if (user?.role !== role) {
    return <Navigate to="/courses" replace />;
  }
  return children;
}
