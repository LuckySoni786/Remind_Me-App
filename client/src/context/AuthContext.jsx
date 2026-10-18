
import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/authApi.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data?.user ?? response.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    return await registerUser(userData);
  };

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const currentUser = await getCurrentUser();

    setUser(
      currentUser.data?.user ??
      currentUser.user ??
      response.data?.user ??
      response.user ??
      null
    );

    return response;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
