import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CustomerUser {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string | undefined;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  isLoggedIn: boolean;
  loginCustomer: (
    email: string,
    password?: string,
    name?: string,
    phone?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (
    name: string,
    email: string,
    phone: string,
    address?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logoutCustomer: () => void;
  updateCustomerProfile: (updates: Partial<CustomerUser>) => void;
}

const STORAGE_CUSTOMER_KEY = "pf_customer_session_v1";

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);

  // Initialize customer session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_CUSTOMER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setCustomer(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load customer session:", err);
      }
    }
  }, []);

  const saveCustomer = (cust: CustomerUser | null) => {
    setCustomer(cust);
    if (typeof window !== "undefined") {
      if (cust) {
        localStorage.setItem(STORAGE_CUSTOMER_KEY, JSON.stringify(cust));
      } else {
        localStorage.removeItem(STORAGE_CUSTOMER_KEY);
      }
    }
  };

  const loginCustomer = async (
    email: string,
    _password?: string,
    name?: string,
    phone?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const emailName = cleanEmail.split("@")[0]?.replace(/[._]/g, " ") || "Customer";
    const customerData: CustomerUser = {
      id: `cust-${Date.now().toString(36)}`,
      name: name?.trim() || emailName,
      email: cleanEmail,
      phone: phone?.trim() || "+91 99401 45700",
    };

    saveCustomer(customerData);
    return { success: true };
  };

  const registerCustomer = async (
    name: string,
    email: string,
    phone: string,
    address?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      return { success: false, error: "Please enter your name." };
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      return { success: false, error: "Please enter a valid phone number." };
    }

    const customerData: CustomerUser = {
      id: `cust-${Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      ...(address?.trim() ? { address: address.trim() } : {}),
    };

    saveCustomer(customerData);
    return { success: true };
  };

  const logoutCustomer = () => {
    saveCustomer(null);
  };

  const updateCustomerProfile = (updates: Partial<CustomerUser>) => {
    if (!customer) return;
    const updated = { ...customer, ...updates };
    saveCustomer(updated);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        updateCustomerProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
