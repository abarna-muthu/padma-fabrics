import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authServices } from "@/services/api";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: "customer" | "admin";
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string, role?: "customer" | "admin") => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const STORAGE_AUTH_USER_KEY = "pf_auth_user_v2";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_AUTH_USER_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load user auth session", e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_AUTH_USER_KEY);
      }
    }
  }, [user]);

  const login = async (
    email: string,
    password?: string,
    role: "customer" | "admin" = "customer",
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    if (role === "admin") {
      const res = await authServices.adminLogin(cleanEmail, password || "");
      if (res.success && res.data) {
        const adminUser: UserProfile = {
          id: res.data.user?.id || "admin_1",
          name: res.data.user?.name || "Administrator",
          email: res.data.user?.email || cleanEmail,
          role: "admin",
        };
        setUser(adminUser);
        toast.success(`Welcome back, ${adminUser.name}`);
        return { success: true };
      }
      return { success: false, error: res.error || "Invalid admin credentials" };
    }

    // Customer login
    const res = await authServices.customerLogin(cleanEmail, password);
    if (res.success && res.data) {
      const custUser: UserProfile = {
        id: res.data.user?.id || `cust_${Date.now().toString(36)}`,
        name: res.data.user?.name || cleanEmail.split("@")[0] || "Customer",
        email: cleanEmail,
        phone: "+91 99401 45700",
        role: "customer",
      };
      setUser(custUser);
      toast.success(`Welcome back, ${custUser.name}`);
      return { success: true };
    }

    return { success: false, error: res.error || "Customer sign-in failed" };
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    address?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await authServices.customerRegister(name, email, phone, address);
    if (res.success && res.data) {
      const newUser: UserProfile = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        address: res.data.address,
        role: "customer",
      };
      setUser(newUser);
      toast.success(`Welcome to Padmanabha Fabrics, ${newUser.name}!`);
      return { success: true };
    }
    return { success: false, error: "Registration failed." };
  };

  const logout = () => {
    authServices.logout();
    setUser(null);
    toast.info("Signed out successfully");
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    toast.success("Profile updated");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
