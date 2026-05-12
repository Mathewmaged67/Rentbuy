import { createFileRoute, useSearch, useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/store/app-store";
import { loginUser, registerUser } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface S { 
  mode?: "login" | "register", 
  verified?: boolean,
  token?: string,
  userId?: string,
  email?: string,
  name?: string,
  role?: string,
  dob?: string
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): S => ({ 
    mode: s.mode === "register" ? "register" : "login",
    verified: s.verified === 'true' || s.verified === true,
    token: s.token as string | undefined,
    userId: s.userId as string | undefined,
    email: s.email as string | undefined,
    name: s.name as string | undefined,
    role: s.role as string | undefined,
    dob: s.dob as string | undefined
  }),

  head: () => ({ meta: [{ title: "Sign in — RentBuy" }] }),
  component: AuthPage,
});

function AuthPage() {
  const searchParams = useSearch({ from: "/auth" });
  const { mode, verified, token, userId, email: sEmail, name: sName, role: sRole, dob: sDob } = searchParams;
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const isRegister = mode === "register";

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle Auto-Login if token is present in URL
  React.useEffect(() => {
    if (verified && token && userId && sEmail && sName) {
      console.log("[Auth] Auto-logging in user from verification link...");
      const role: "admin" | "seller" | "customer" = 
        sRole === "admin" ? "admin" : sRole === "seller" ? "seller" : "customer";
      
      dispatch({
        type: "LOGIN",
        role,
        user: { name: sName, email: sEmail, id: userId, dob: sDob },
        token: token,
      });

      const dest =
        role === "admin" ? "/dashboard/admin" : role === "seller" ? "/dashboard/seller" : "/dashboard";
      navigate({ to: dest });
    }
  }, [verified, token, userId, sEmail, sName, sRole, dispatch, navigate]);


  // Reset extra fields when switching modes
  React.useEffect(() => {
    setErr(null);
    setSuccess(null);
    setPhone("");
    setAddress("");
    setDob("");
  }, [mode]);


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6 || (isRegister && name.trim().length < 2)) {
      setErr("Please enter a valid email, password (6+ chars), and name.");
      return;
    }
    if (isRegister && !dob) {
      setErr("Please enter your date of birth.");
      return;
    }

    setErr(null);
    setSuccess(null);
    setIsLoading(true);

    // All logins now go through the backend to ensure real JWT tokens


    try {
      let data;
      if (isRegister) {
        data = await registerUser(name, email, password, {
          phone: phone || undefined,
          address: address || undefined,
          dob: dob || undefined,
        });
      } else {
        data = await loginUser(email, password);
      }

      if (data.user && data.token) {
        const role: "admin" | "seller" | "customer" =
          data.user.role === "admin"
            ? "admin"
            : data.user.role === "seller"
              ? "seller"
              : "customer";

        dispatch({
          type: "LOGIN",
          role,
          user: { name: data.user.name, email: data.user.email, id: data.user.id, dob: data.user.dob },
          token: data.token,
        });

        // If dob is missing (old accounts), redirect to complete profile
        if (!data.user.dob && role === "customer") {
          navigate({ to: "/profile/complete" });
          return;
        }

        const dest =
          role === "admin"
            ? "/dashboard/admin"
            : role === "seller"
              ? "/dashboard/seller"
              : "/dashboard";
        navigate({ to: dest });
      } else if (isRegister || (data.user && data.user.status === 'pending')) {
        setSuccess(data.message || "Registration successful! Please check your email to verify your account.");
      } else {
        setErr("Unexpected response from server. Missing user or token.");
      }
    } catch (error: any) {
      setErr(error.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center px-6 py-10">
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-semibold">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister
              ? "Fill in your details to get started."
              : "Sign in to access your dashboard and manage your items."}
          </p>
        </div>

        {verified && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg text-sm text-center">
            Email verified successfully! Please sign in.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          {/* ── Register-only fields ── */}
          {isRegister && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name *</Label>
                <Input
                  id="name"
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
            </>
          )}

          {/* ── Shared fields ── */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* ── Extra register fields ── */}
          {isRegister && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  disabled={isLoading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  disabled={isLoading}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  disabled={isLoading}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  🎂 We'll send you a birthday surprise!
                </p>
              </div>
            </>
          )}

          {err && <p className="text-sm text-destructive">{err}</p>}
          {success && <p className="text-sm text-green-500 font-medium">{success}</p>}

          <Button type="submit" disabled={isLoading} className="w-full bg-gradient-ink">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRegister ? "Create account" : "Sign in"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {isRegister ? (
              <>Already have an account?{" "}
                <Link to="/auth" className="font-medium text-foreground hover:underline">Sign in</Link>
              </>
            ) : (
              <>New to RentBuy?{" "}
                <Link to="/auth" search={{ mode: "register" } as never} className="font-medium text-foreground hover:underline">Create account</Link>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
