"use client";

import { redirect } from "next/navigation";
import { useAuth, AUTH_ENABLED } from "@/contexts/AuthContext";

// Replaces the old react-router <PrivateRoute>. It wraps the whole (main)
// route group, so every page in there is protected once AUTH_ENABLED is on.
export default function RequireAuth({ children }) {
  const { user } = useAuth();

  if (AUTH_ENABLED && !user) {
    redirect("/login");
  }

  return children;
}
