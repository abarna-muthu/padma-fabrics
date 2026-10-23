import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/padmanabha-logo.jpg";
import { useAdminAuth } from "@/context/AdminAuthContext";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In | Padmanabha Fabrics" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

export function AdminLoginView({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated and standalone, redirect to /admin
  useEffect(() => {
    if (isAuthenticated) {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate({ to: "/admin" });
      }
    }
  }, [isAuthenticated, navigate, onLoginSuccess]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigate({ to: "/admin" });
        }
      } else {
        setError(result.error || "Authentication failed. Please verify credentials.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <img
              src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
              className="w-14 h-14 rounded-full object-cover shadow-md ring-2 ring-[#B8913A]/40"
              alt="Padmanabha Fabrics"
              width={56}
              height={56}
            />
            <div className="text-left">
              <div className="font-['Cormorant_Garamond'] text-2xl font-semibold tracking-tight text-[#0E0E0E]">
                Padmanabha
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#B8913A] font-medium">
                Fabrics · Chennai
              </div>
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-[#B8913A]/30 text-[#0E0E0E] rounded-full text-[11px] font-medium shadow-2xs mt-2">
            <ShieldCheck className="size-3.5 text-[#B8913A]" />
            <span className="uppercase tracking-wider text-[10px] text-[#B8913A] font-semibold">Private Admin Portal</span>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-normal mt-4 text-[#0E0E0E]">
            Admin Sign In
          </h1>
          <p className="text-xs text-[#0E0E0E]/60 font-light mt-1.5">
            Store management, customer orders, inventory, and analytics
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[rgba(14,14,14,0.08)] rounded-2xl p-7 sm:p-9 shadow-[0_20px_50px_rgba(14,14,14,0.05)]">
          {error && (
            <div
              className="mb-6 p-3.5 bg-[#6B1E2E]/10 border border-[#6B1E2E]/25 text-[#6B1E2E] text-xs flex items-start gap-2.5 rounded-xl"
              role="alert"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-[#0E0E0E] tracking-wide">
                Username / Email Address
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="rounded-xl border-[rgba(14,14,14,0.15)] bg-[#FAF7F2]/50 focus-visible:ring-1 focus-visible:ring-[#B8913A] focus-visible:border-[#B8913A] text-xs h-10 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="admin-password" className="text-xs font-medium text-[#0E0E0E] tracking-wide">
                  Password
                </label>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="rounded-xl border-[rgba(14,14,14,0.15)] bg-[#FAF7F2]/50 focus-visible:ring-1 focus-visible:ring-[#B8913A] focus-visible:border-[#B8913A] text-xs h-10 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0E0E0E]/50 hover:text-[#0E0E0E] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-full bg-[#0E0E0E] hover:bg-[#6B1E2E] text-[#F4F0E8] text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Lock className="size-3.5" />
              <span>{isSubmitting ? "Authenticating..." : "Sign In to Admin Portal"}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </form>
        </div>

        {/* Back to storefront link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-[#0E0E0E]/60 hover:text-[#B8913A] transition-colors inline-flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="size-3.5" /> Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminLoginPage() {
  return <AdminLoginView />;
}
