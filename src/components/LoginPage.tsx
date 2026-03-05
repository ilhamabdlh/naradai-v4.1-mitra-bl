import { useState, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Eye, EyeOff, Shield } from "lucide-react";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = login(username, password);
    setLoading(false);
    if (ok) {
      navigate(returnUrl, { replace: true });
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-100/50 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-100/50 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_var(--tw-gradient-stops))] from-violet-50/30 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-8">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-200/50 group-hover:shadow-violet-300/60 transition-shadow duration-300">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Narad<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600">ai</span>
              </h1>
              <p className="text-xs text-slate-600">AI-Powered Social Intelligence</p>
            </div>
          </a>
        </div>

        <Card className="border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden ring-1 ring-slate-100/50">
          <CardHeader className="space-y-1.5 pb-2 pt-7 px-7">
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-500" />
              Welcome
            </CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to access the dashboard, insights, and recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="username"
                  className={cn(
                    "rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-11 transition-all duration-200",
                    focusedField === "username"
                      ? "ring-2 ring-violet-500/25 border-violet-300"
                      : "focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  )}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="current-password"
                    className={cn(
                      "rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-11 pr-11 transition-all duration-200",
                      focusedField === "password"
                        ? "ring-2 ring-violet-500/25 border-violet-300"
                        : "focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-violet-600 rounded p-1 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex items-center gap-2 animate-in fade-in duration-200"
                  role="alert"
                >
                  <span className="flex-1">{error}</span>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all duration-200 disabled:opacity-70"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          © NaradAI · Social Intelligence Platform
        </p>
      </div>
    </div>
  );
}
