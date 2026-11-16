import { queryClient } from "@/lib/queryClient";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type UserRole =
  | "Super Admin"
  | "Plant Admin"
  | "Gate Operator"
  | "Segregation Supervisor"
  | "Stock Manager"
  | "Sales Manager";

export interface ProfileData {
  plantEmployeeId?: number;
  plantId?: number;
  adminId?: number;
  fullName: string;
  roleName: UserRole | string;
  roleCode?: string;
}

interface AuthContextType {
  profileData: ProfileData | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (token: string, profileData: ProfileData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "dwpps_token";
const PROFILE_KEY = "profileData";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [profileData, setProfileData] = useState<ProfileData | null>(() =>
    safeParse<ProfileData>(sessionStorage.getItem(PROFILE_KEY)),
  );

  const setSession = useCallback((newToken: string, newProfile: ProfileData) => {
    setToken(newToken);
    setProfileData(newProfile);
    queryClient.clear();
    sessionStorage.setItem(TOKEN_KEY, newToken);
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setProfileData(null);

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      profileData,
      token,
      isAuthenticated: !!token,
      setSession,
      logout,
    }),
    [profileData, token, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
