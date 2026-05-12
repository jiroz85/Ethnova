"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MeUser = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  telegram_username: string | null;
  role: string;
  created_at: string;
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

export default function SellerProfilePage() {
  const router = useRouter();
  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  const [user, setUser] = useState<MeUser | null>(() => {
    try {
      const rawUser = localStorage.getItem("ethnova_user");
      return rawUser ? (JSON.parse(rawUser) as MeUser) : null;
    } catch {
      return null;
    }
  });

  const token = useMemo(() => {
    try {
      return localStorage.getItem("ethnova_access_token");
    } catch {
      return null;
    }
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states - initialize from user data
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [telegramUsername, setTelegramUsername] = useState(
    user?.telegram_username || "",
  );

  useEffect(() => {
    if (token === null) return;

    if (!token) {
      router.replace("/seller/login");
      return;
    }
  }, [apiBaseUrl, router, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          telegram_username: telegramUsername.trim() || null,
        }),
      });

      const data: unknown = await res.json().catch(() => null);

      if (res.status === 401) {
        localStorage.removeItem("ethnova_access_token");
        localStorage.removeItem("ethnova_user");
        router.replace("/seller/login");
        return;
      }

      if (!res.ok) {
        throw new Error(
          getErrorMessage(data, `Update failed (HTTP ${res.status})`),
        );
      }

      // Update local storage with new user data
      const updatedUser = data as MeUser;
      localStorage.setItem("ethnova_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    localStorage.removeItem("ethnova_access_token");
    localStorage.removeItem("ethnova_user");
    router.replace("/");
  }

  if (token === null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Seller Profile</h1>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Manage your store information and contact details
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/seller/dashboard"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
          >
            Dashboard
          </a>
          <button
            onClick={logout}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:bg-black dark:border-white/10">
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Store Information</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              This information will be visible to customers
            </p>
          </div>

          <label className="block text-sm font-medium">Store Name</label>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Your store name"
          />

          <label className="mt-4 block text-sm font-medium">
            Email Address
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@yourstore.com"
          />

          <label className="mt-4 block text-sm font-medium">Phone Number</label>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 9X XXX XXXX"
          />

          <label className="mt-4 block text-sm font-medium">
            Telegram Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400">
              @
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 pl-8 pr-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="yourstore"
            />
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Contact Information Display
            </h3>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              Customers will see your phone number and Telegram username on your
              product pages. Make sure these are accurate so customers can reach
              you easily.
            </p>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background disabled:opacity-60"
            type="submit"
          >
            {submitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {user && (
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:bg-black dark:border-white/10">
          <h2 className="text-lg font-semibold">Account Information</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                Member Since
              </span>
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                Account Type
              </span>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-500/20 dark:text-green-200">
                {user.role === "admin" ? "Administrator" : "Seller"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">
                Account ID
              </span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
