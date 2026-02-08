"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAccessToken, removeAccessToken, getUserInfo, UserResponseDto } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserResponseDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    const token = getAccessToken();
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userInfo = await getUserInfo();
      setUser(userInfo);
      setLoading(false);
    } catch (error) {
      removeAccessToken();
      setUser(null);
      setLoading(false);
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        router.push("/login");
      }
    }
  };

  const logout = async () => {
    try {
      const { logout: apiLogout } = await import("@/lib/api");
      await apiLogout();
    } catch (error) {
    } finally {
      removeAccessToken();
      setUser(null);
      router.push("/login");
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
