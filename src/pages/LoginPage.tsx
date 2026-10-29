import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Lock, Mail, Phone, User } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { loginCustomer, registerCustomer, isLoggedIn, customer } = useCustomerAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegisterMode) {
      const res = await registerCustomer(name, email, phone);
      setLoading(false);
      if (res.success) {
        toast.success(`Welcome, ${name}! Your account is ready.`);
        navigate({ to: "/orders" });
      } else {
        toast.error(res.error || "Registration failed");
      }
    } else {
      const res = await loginCustomer(email, password, name, phone);
      setLoading(false);
      if (res.success) {
        toast.success("Signed in successfully");
        navigate({ to: "/orders" });
      } else {
        toast.error(res.error || "Login failed");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Breadcrumb items={[{ label: "Account Access" }]} className="mb-6 justify-center" />

      <div className="p-8 border border-[#D15608]/30 rounded-lg bg-white dark:bg-[#262022] shadow-md text-center">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#9F160A] dark:text-[#FAF6EE]">
          {isRegisterMode ? "Create Your Account" : "Sign In to Padmanabha"}
        </h2>
        <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-1.5 mb-6">
          Access your orders, saved fabrics, and exclusive wholesale previews.
        </p>

        {isLoggedIn && customer ? (
          <div className="p-4 bg-[#FAF6EE] dark:bg-black/20 rounded border border-[#D15608]/30 space-y-3">
            <p className="text-xs text-[#8A9A7B] font-semibold">Currently signed in as:</p>
            <p className="text-sm font-bold text-[#9F160A] dark:text-[#FAF6EE]">{customer.name} ({customer.email})</p>
            <div className="pt-2 flex justify-center gap-2">
              <Link
                to="/orders"
                className="px-4 py-2 rounded bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                View My Orders
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            {isRegisterMode && (
              <div>
                <label className="text-[11px] font-semibold text-[#5C5549]">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#D15608]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded border border-[#E5DAC4] bg-[#FAF6EE] dark:bg-black/20 focus:outline-none focus:border-[#D15608]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-[#5C5549]">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#D15608]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded border border-[#E5DAC4] bg-[#FAF6EE] dark:bg-black/20 focus:outline-none focus:border-[#D15608]"
                />
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="text-[11px] font-semibold text-[#5C5549]">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#D15608]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded border border-[#E5DAC4] bg-[#FAF6EE] dark:bg-black/20 focus:outline-none focus:border-[#D15608]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-[#5C5549]">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#D15608]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded border border-[#E5DAC4] bg-[#FAF6EE] dark:bg-black/20 focus:outline-none focus:border-[#D15608]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-md shadow-xs transition-colors"
            >
              {loading ? "Processing..." : isRegisterMode ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center pt-3 border-t border-[#E5DAC4] mt-4">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-[#D15608] hover:underline font-semibold cursor-pointer"
              >
                {isRegisterMode
                  ? "Already have an account? Sign in here"
                  : "New to Padmanabha? Register an account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
