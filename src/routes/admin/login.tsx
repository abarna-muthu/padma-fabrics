import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
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

function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate({ to: "/admin" });
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
    <div className="min-h-screen bg-sand-50 dark:bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <img
              src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
              className="w-14 h-14 rounded-full object-cover shadow-sm ring-1 ring-border"
              alt="Padmanabha Fabrics"
              width={56}
              height={56}
            />
            <div className="text-left">
              <div className="font-display text-2xl font-semibold text-primary">Padmanabha</div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Fabrics · Chennai
              </div>
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-primary rounded-full text-xs font-medium mt-2">
            <ShieldCheck className="size-3.5 text-gold" />
            <span>Private Admin Portal</span>
          </div>
          <h1 className="font-display text-3xl font-medium mt-4 text-foreground">
            Sign In
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Authorized store administration and inventory management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border p-8 shadow-sm">
          {error && (
            <div
              className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="rounded-none border-border focus-visible:ring-primary text-xs h-10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="admin-password" className="text-xs font-medium text-foreground">
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
                  placeholder="••••••••"
                  className="rounded-none border-border focus-visible:ring-primary text-xs h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="editorial"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              <Lock className="size-4 mr-2" />
              {isSubmitting ? "Authenticating..." : "Sign In"}
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </form>
        </div>

        {/* Back to storefront link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" /> Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
