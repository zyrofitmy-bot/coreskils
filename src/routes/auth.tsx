import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { PublicLayout } from "@/components/layout/PublicLayout";
import logoMark from "@/assets/logo-mark.svg.asset.json";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — CoreSkils" },
      { name: "description", content: "Sign in or create your CoreSkils account." },
      { property: "og:title", content: "Sign in — CoreSkils" },
      { property: "og:description", content: "Sign in or create your CoreSkils account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setConfirmSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard/student" });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed");
  }

  return (
    <PublicLayout>
      <section className="mx-auto flex max-w-md flex-col px-6 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <img src={logoMark.url} alt="CoreSkils" className="mx-auto h-12 w-12" />
          {confirmSent ? (
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-bold text-card-foreground">Check your email</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it
                to activate your account, then sign in.
              </p>
              <button
                onClick={() => {
                  setConfirmSent(false);
                  setIsSignup(false);
                }}
                className="mt-6 text-sm font-semibold text-primary hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="mt-4 text-center text-2xl font-bold text-card-foreground">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>
              <button
                onClick={handleGoogle}
                className="mt-6 w-full rounded-full border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Continue with Google
              </button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    required
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
                </button>
              </form>
              {!isSignup && (
                <p className="mt-3 text-center text-xs">
                  <Link to="/reset-password" className="text-primary hover:underline">
                    Forgot your password?
                  </Link>
                </p>
              )}
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {isSignup ? "Already have an account?" : "New to CoreSkils?"}{" "}
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="font-semibold text-primary hover:underline"
                >
                  {isSignup ? "Sign in" : "Create account"}
                </button>
              </p>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
