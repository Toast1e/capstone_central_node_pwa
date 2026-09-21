"use client";

import { createContext, useContext, useState } from "react";

// Authentication is stubbed out while the app is being designed.
// Set to true once login() talks to a real auth service; RequireAuth
// will then start redirecting signed-out visitors to /login.
export const AUTH_ENABLED = false;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // TODO: replace with a real call to the auth service.
  // No credentials are checked - every login succeeds.
  const login = async () => {
    setLoading(true);
    const placeholderUser = { username: "guest" };
    setUser(placeholderUser);
    setLoading(false);
    return { success: true, user: placeholderUser };
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
