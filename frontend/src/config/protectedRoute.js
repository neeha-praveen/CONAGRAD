import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, userType = "expert" }) {
  const tokenKey = userType === "expert" ? "expertToken" : "studentToken";
  const token = localStorage.getItem(tokenKey);

  if (!token) {
    return <Navigate to={userType === "expert" ? "/expert-login" : "/login"} replace />;
  }

  return children;
}
