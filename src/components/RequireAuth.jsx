"use client";

import { redirect, usePathname } from "next/navigation";
import { useAuth, AUTH_ENABLED, isSessionValid } from "@/contexts/AuthContext";
import { useEffect } from "react";

// Replaces the old react-router <PrivateRoute>. It wraps the whole (main)
// route group, so every page in there is protected once AUTH_ENABLED is on.
export default function RequireAuth({ children }) {
  const { isAuthenticated, initialized, logout } = useAuth();
  const pathName = usePathname();

  // Recheck expiry on every page change (re-render)
  useEffect(() => {
    if (isAuthenticated && !isSessionValid()) logout();
  }, [pathName]);

  if (!initialized) {
    return null;
  }

  if (AUTH_ENABLED && !isAuthenticated) {
    redirect("/login");
  }

  return children;
}
