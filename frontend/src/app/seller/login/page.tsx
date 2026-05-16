"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type LoginResponse = {
  access_token: string;
  user: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    role: string;
  };
};

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  if (!("message" in data)) return fallback;

  const msg = (data as { message?: unknown }).message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg) && msg.every((x) => typeof x === "string"))
    return msg.join(", ");
  return fallback;
}

export default function SellerLoginPage() {
  const router = useRouter();

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(data, `Login failed (HTTP ${res.status})`),
        );
      }

      const parsed = data as LoginResponse;

      localStorage.setItem("ethnova_access_token", parsed.access_token);
      localStorage.setItem("ethnova_user", JSON.stringify(parsed.user));

      // Redirect based on user role
      if (parsed.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/seller/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Seller login</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Login to manage your products.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:bg-black dark:border-white/10"
      >
        <label className="block text-sm font-medium">Email or phone</label>
        <input
          className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:bg-white/5 dark:border-white/10"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          placeholder="seller@example.com"
          autoComplete="username"
          required
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:bg-white/5 dark:border-white/10"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error ? (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <button
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background disabled:opacity-60"
          type="submit"
        >
          {loading ? "Logging in…" : "Login"}
        </button>

        <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          No account?{" "}
          <a className="underline" href="/seller/register">
            Register
          </a>
        </div>
      </form>
    </div>
  );
}
