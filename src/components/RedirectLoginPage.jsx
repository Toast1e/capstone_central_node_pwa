// Needs a component, because the src/auth/page.jsx is server rendered and need "use client" for the implementation.

// Component's purpose to catch logged in users and redirect them to the home page.
"use client";

import { redirect } from "next/navigation";
import { useAuth, AUTH_ENABLED } from "@/contexts/AuthContext";

// Keeps signed-in users off the login page.
export default function RedirectIfAuthenticated({ children }) {
    const { isAuthenticated, initialized } = useAuth();

  if (!initialized) return null;

  if (AUTH_ENABLED && isAuthenticated) {
    redirect("/home");
  }

  return children;
}