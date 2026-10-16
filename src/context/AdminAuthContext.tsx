import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, getAdminToken, removeAdminToken } from "@/lib/api";

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: "admin";
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCredentials: (
    currentPass: string,
    newEmail: string,
    newPass: string,
  ) => Promise<{ success: boolean; error?: string }>;
  isStageA: boolean;
}

const STORAGE_SESSION_KEY = "pf_admin_session";
const STORAGE_CREDS_KEY = "pf_admin_credentials";

// Initial development credentials requested for controlled setup provisioning
const INITIAL_CREDENTIALS = {
  email: "admin@gmail.com",
  password: "admin123",
  name: "Padmanabha Administrator",
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize from session on mount and verify with backend if token exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initAuth = async () => {
        try {
          const storedSession = sessionStorage.getItem(STORAGE_SESSION_KEY);
          if (storedSession) {
            const parsed = JSON.parse(storedSession);
            if (parsed && parsed.role === "admin") {
              setIsAuthenticated(true);
              setUser(parsed);
            }
          }

          // If a backend JWT token exists, verify profile with server
          const token = getAdminToken();
          if (token) {
            const profileRes = await authApi.getProfile();
            if (profileRes.success && profileRes.data) {
              const verifiedUser: AdminUser = {
                id: profileRes.data.id,
                email: profileRes.data.email,
                name: profileRes.data.name || "Padmanabha Administrator",
                role: "admin",
              };
              setIsAuthenticated(true);
              setUser(verifiedUser);
              sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(verifiedUser));
            }
          }
        } catch (err) {
          console.error("Failed to parse admin session:", err);
        } finally {
          setIsReady(true);
        }
      };

      initAuth();
    }
  }, []);

  const getActiveCredentials = () => {
    if (typeof window === "undefined") return INITIAL_CREDENTIALS;
    try {
      const stored = sessionStorage.getItem(STORAGE_CREDS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_CREDENTIALS;
  };

  const login = async (
    email: string,
    pass: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. First attempt secure backend database authentication with bcrypt & JWT
    try {
      const apiRes = await authApi.adminLogin(cleanEmail, pass);
      if (apiRes.success && apiRes.data?.user) {
        const adminUser: AdminUser = {
          id: apiRes.data.user.id,
          email: apiRes.data.user.email,
          name: apiRes.data.user.name || "Padmanabha Administrator",
          role: "admin",
        };
        setIsAuthenticated(true);
        setUser(adminUser);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(adminUser));
        }
        return { success: true };
      } else if (
        apiRes.error &&
        !apiRes.error.includes("failed to fetch") &&
        !apiRes.error.includes("Network")
      ) {
        // Backend actively returned 401 or invalid credentials
        return {
          success: false,
          error: apiRes.error || "Invalid email or password. Please verify credentials.",
        };
      }
    } catch (err) {
      console.warn("Backend login connection warning, checking local fallback:", err);
    }

    // 2. Local fallback if backend is offline
    const creds = getActiveCredentials();
    const cleanExpectedEmail = creds.email.trim().toLowerCase();

    if (cleanEmail === cleanExpectedEmail && pass === creds.password) {
      const adminUser: AdminUser = {
        email: creds.email,
        name: creds.name || "Padmanabha Administrator",
        role: "admin",
      };
      setIsAuthenticated(true);
      setUser(adminUser);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(adminUser));
      }
      return { success: true };
    }

    return {
      success: false,
      error: "Invalid email or password. Please verify your credentials and try again.",
    };
  };

  const logout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setUser(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    }
  };

  const updateCredentials = async (
    currentPass: string,
    newEmail: string,
    newPass: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanNewEmail = newEmail.trim().toLowerCase();
    if (!cleanNewEmail || !cleanNewEmail.includes("@") || !cleanNewEmail.includes(".")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    if (!newPass || newPass.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    // 1. First attempt backend credential change
    try {
      const apiRes = await authApi.updateCredentials(currentPass, cleanNewEmail, newPass);
      if (apiRes.success && apiRes.data?.user) {
        const updatedUser: AdminUser = {
          email: apiRes.data.user.email,
          name: apiRes.data.user.name || "Padmanabha Administrator",
          role: "admin",
        };
        setUser(updatedUser);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedUser));
        }
        return { success: true };
      } else if (
        apiRes.error &&
        !apiRes.error.includes("failed to fetch") &&
        !apiRes.error.includes("Network")
      ) {
        return { success: false, error: apiRes.error };
      }
    } catch (err) {
      console.warn("Backend credential update warning, checking local fallback:", err);
    }

    // 2. Local fallback if backend is offline
    const creds = getActiveCredentials();
    if (currentPass !== creds.password) {
      return { success: false, error: "The current password you entered is incorrect." };
    }

    const updatedCreds = {
      ...creds,
      email: cleanNewEmail,
      password: newPass,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_CREDS_KEY, JSON.stringify(updatedCreds));
      const updatedUser: AdminUser = {
        email: cleanNewEmail,
        name: creds.name || "Padmanabha Administrator",
        role: "admin",
      };
      setUser(updatedUser);
      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedUser));
    }

    return { success: true };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        updateCredentials,
        isStageA: true,
      }}
    >
      {isReady ? children : children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
