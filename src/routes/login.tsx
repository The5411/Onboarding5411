import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: "/" });
    }
  }, [isLoading, user, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "sign-up") {
      setSignedUp(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <h1 className="text-2xl font-bold tracking-tight">Onboarding 5411</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "sign-in" ? "Iniciá sesión para continuar." : "Creá tu cuenta para continuar."}
        </p>

        {signedUp ? (
          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
            Cuenta creada. Revisá tu mail para confirmar la cuenta y después iniciá sesión.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity disabled:opacity-60"
              style={{ background: "var(--gradient-hero)" }}
            >
              {submitting
                ? "Un momento..."
                : mode === "sign-in"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            setError(null);
            setSignedUp(false);
          }}
          className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {mode === "sign-in" ? "¿No tenés cuenta? Creá una" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>
      </div>
    </div>
  );
}
