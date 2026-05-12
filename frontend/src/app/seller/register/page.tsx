"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type RegisterResponse = {
  access_token: string;
  user: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    telegram_username: string | null;
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

export default function SellerRegisterPage() {
  const router = useRouter();

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: email.trim() ? email : undefined,
          phone: phone.trim() ? phone : undefined,
          telegram_username: telegram.trim() ? telegram : undefined,
          password,
        }),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(data, `Register failed (HTTP ${res.status})`),
        );
      }

      const parsed = data as RegisterResponse;

      localStorage.setItem("ethnova_access_token", parsed.access_token);
      localStorage.setItem("ethnova_user", JSON.stringify(parsed.user));

      router.push("/seller/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Seller registration</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Create an account to post products.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:bg-black dark:border-white/10"
      >
        <label className="block text-sm font-medium">Full name</label>
        <input
          className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:bg-white/5 dark:border-white/10"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          required
        />

        <label className="mt-4 block text-sm font-medium">
          Email (optional)
        </label>
        <input
          className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:bg-white/5 dark:border-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seller@example.com"
          autoComplete="email"
        />

        <label className="mt-4 block text-sm font-medium">
          Phone (optional)
        </label>
        <input
          className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:bg-white/5 dark:border-white/10"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+251..."
          autoComplete="tel"
        />

        <label className="mt-4 block text-sm font-medium">
          Telegram (optional)
        </label>
        <input
          className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:bg-white/5 dark:border-white/10"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder="@username"
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:bg-white/5 dark:border-white/10"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          Password must be at least 6 characters.
        </div>

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
          {loading ? "Creating…" : "Create account"}
        </button>

        <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <a className="underline" href="/seller/login">
            Login
          </a>
        </div>
      </form>
    </div>
  );
}
