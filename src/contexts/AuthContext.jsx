"use client";

import { createContext, useContext, useState,useEffect } from "react";
import bcrypt from "bcryptjs";

// RequireAuth redirects signed-out visitors to /login while authentication is enabled.
export const AUTH_ENABLED = true;

const AuthContext = createContext();

// Key used for browser storage
const STORAGE_KEY = "isAuthenticated";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);


  // Check local storage to see if user is authenticated and restore login flag after refresh.
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
      if (saved === "true") setIsAuthenticated(true);
    } catch {
      // storage unavailable: stay signed out
    }
    setInitialized(true);
  }, []);

  const login = async (password,remember = false) => {
    setLoading(true);

    try
    {

      const hash = process.env.NEXT_PUBLIC_PASSWORD_HASH;
      if (!hash) return { success: false, error: "Login is not configured." };  // check if password is actually in .env file
      if (!password) return { success: false, error: "Enter a password." };     // validate that user did enter a password

      // Compare the submitted password against the configured bcrypt hash.
      const ok = await bcrypt.compare(password,hash);
      if(!ok) return { success: false, error: "Incorrect password." };
      

      setIsAuthenticated(true);

      // Keep user logged in after closing tab/browser 
      const store = remember ? localStorage : sessionStorage;
      store.setItem(STORAGE_KEY, "true");

      return { success: true };

    } 
    finally 
    {
      setLoading(false);
    }

    
  
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const value = { isAuthenticated, initialized, loading, login, logout };

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
