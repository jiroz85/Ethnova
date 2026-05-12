"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MeUser = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
};

type MyProduct = {
  id: string;
  title: string;
  description: string;
  price: string | number;
  currency: string;
  city?: string | null;
  area?: string | null;
  location_text: string | null;
  is_published: boolean;
  is_sold: boolean;
  created_at: string;
  updated_at: string;
  category: { id: string; name: string; slug: string };
};

function formatLocation(p: {
  city?: string | null;
  area?: string | null;
  location_text?: string | null;
}) {
  const city = p.city?.trim() ? p.city.trim() : "";
  const area = p.area?.trim() ? p.area.trim() : "";
  const locationText = p.location_text?.trim() ? p.location_text.trim() : "";
  if (locationText) return locationText;
  if (city && area) return `${city} - ${area}`;
  return city || area || "";
}

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  if (!("message" in data)) return fallback;

  const msg = (data as { message?: unknown }).message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg) && msg.every((x) => typeof x === "string"))
    return msg.join(", ");
  return fallback;
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  const [user, setUser] = useState<MeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<MyProduct[]>([]);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("ethnova_user");
      setUser(rawUser ? (JSON.parse(rawUser) as MeUser) : null);
    } catch {
      setUser(null);
    }

    try {
      setToken(localStorage.getItem("ethnova_access_token"));
    } catch {
      setToken(null);
    }
  }, []);

  useEffect(() => {
    if (token === null) return;

    if (!token) {
      router.replace("/seller/login");
      return;
    }

    async function load() {
      setError(null);
      setLoading(true);

      try {
        const res = await fetch(`${apiBaseUrl}/products/mine/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("ethnova_access_token");
          localStorage.removeItem("ethnova_user");
          router.replace("/seller/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`Request failed (HTTP ${res.status})`);
        }

        const data: unknown = await res.json();
        setProducts(Array.isArray(data) ? (data as MyProduct[]) : []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [apiBaseUrl, router, token]);

  function logout() {
    localStorage.removeItem("ethnova_access_token");
    localStorage.removeItem("ethnova_user");
    router.replace("/");
  }

  function goToNewProduct() {
    router.push("/seller/products/new");
  }

  async function togglePublish(p: MyProduct) {
    if (!token) return;
    setError(null);

    const next = !p.is_published;
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, is_published: next } : x)),
    );

    try {
      const res = await fetch(
        `${apiBaseUrl}/products/${encodeURIComponent(p.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_published: next }),
        },
      );

      const data = await safeJson(res);

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
    } catch (e: unknown) {
      setProducts((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, is_published: p.is_published } : x,
        ),
      );
      setError(e instanceof Error ? e.message : "Failed to update product");
    }
  }

  async function toggleSold(p: MyProduct) {
    if (!token) return;
    setError(null);

    const next = !p.is_sold;
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, is_sold: next } : x)),
    );

    try {
      const res = await fetch(
        `${apiBaseUrl}/products/${encodeURIComponent(p.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_sold: next }),
        },
      );

      const data = await safeJson(res);

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
    } catch (e: unknown) {
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, is_sold: p.is_sold } : x)),
      );
      setError(e instanceof Error ? e.message : "Failed to update product");
    }
  }

  async function deleteProduct(p: MyProduct) {
    if (!token) return;
    setError(null);

    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    const prevProducts = products;
    setProducts((cur) => cur.filter((x) => x.id !== p.id));

    try {
      const res = await fetch(
        `${apiBaseUrl}/products/${encodeURIComponent(p.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await safeJson(res);

      if (res.status === 401) {
        localStorage.removeItem("ethnova_access_token");
        localStorage.removeItem("ethnova_user");
        router.replace("/seller/login");
        return;
      }

      if (!res.ok) {
        throw new Error(
          getErrorMessage(data, `Delete failed (HTTP ${res.status})`),
        );
      }
    } catch (e: unknown) {
      setProducts(prevProducts);
      setError(e instanceof Error ? e.message : "Failed to delete product");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Seller dashboard</h1>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {user ? `Welcome, ${user.full_name}` : "Welcome"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToNewProduct}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Add product
          </button>
          <button
            onClick={logout}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:bg-black dark:border-white/10">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading…
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-sm font-semibold">My products</div>

            {products.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                You have no products yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-black/10 p-4 dark:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <a className="min-w-0 flex-1" href={`/product/${p.id}`}>
                        <div className="truncate text-base font-semibold">
                          {p.title}
                        </div>
                        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {p.category?.name ?? "—"}
                          {formatLocation(p) ? ` • ${formatLocation(p)}` : ""}
                        </div>
                        <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {p.is_published ? "Published" : "Hidden"}
                          {p.is_sold ? " • Sold" : ""}
                        </div>
                      </a>

                      <div className="shrink-0 text-right">
                        <div className="text-base font-semibold">
                          {p.price} {p.currency}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`/seller/products/${p.id}/edit`}
                        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
                      >
                        Edit
                      </a>
                      <button
                        type="button"
                        onClick={() => void togglePublish(p)}
                        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
                      >
                        {p.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleSold(p)}
                        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
                      >
                        {p.is_sold ? "Mark unsold" : "Mark sold"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteProduct(p)}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
