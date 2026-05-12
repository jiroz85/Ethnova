"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };

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

export default function SellerEditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  const productId = params.id;

  const [token] = useState<string | null>(() => {
    try {
      return localStorage.getItem("ethnova_access_token");
    } catch {
      return null;
    }
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isSold, setIsSold] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/seller/login");
      return;
    }

    async function load() {
      setError(null);
      setLoading(true);

      try {
        const [categoriesRes, mineRes] = await Promise.all([
          fetch(`${apiBaseUrl}/categories`, { cache: "no-store" }),
          fetch(`${apiBaseUrl}/products/mine/list`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
        ]);

        if (mineRes.status === 401) {
          localStorage.removeItem("ethnova_access_token");
          localStorage.removeItem("ethnova_user");
          router.replace("/seller/login");
          return;
        }

        if (!categoriesRes.ok)
          throw new Error(`Categories failed (HTTP ${categoriesRes.status})`);
        if (!mineRes.ok)
          throw new Error(`Products failed (HTTP ${mineRes.status})`);

        const catData = (await categoriesRes.json()) as Category[];
        setCategories(Array.isArray(catData) ? catData : []);

        const mineData: unknown = await mineRes.json();
        const mine = Array.isArray(mineData) ? (mineData as MyProduct[]) : [];
        const product = mine.find((p) => p.id === productId);

        if (!product) throw new Error("Product not found in your listings");

        setCategoryId(product.category?.id ?? "");
        setTitle(product.title ?? "");
        setDescription(product.description ?? "");
        setPrice(String(product.price ?? ""));
        setCurrency(product.currency ?? "USD");
        const fallback = formatLocation(product);
        setCity(
          product.city ??
            (fallback.includes(" - ") ? fallback.split(" - ")[0] : fallback),
        );
        setArea(
          product.area ??
            (fallback.includes(" - ") ? fallback.split(" - ")[1] : ""),
        );
        setIsPublished(Boolean(product.is_published));
        setIsSold(Boolean(product.is_sold));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [apiBaseUrl, productId, router, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSubmitting(true);

    try {
      const numericPrice = Number(price);
      if (!Number.isFinite(numericPrice)) {
        throw new Error("Price must be a number");
      }

      const res = await fetch(
        `${apiBaseUrl}/products/${encodeURIComponent(productId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category_id: categoryId,
            title,
            description,
            price: numericPrice,
            currency,
            city: city.trim() ? city : null,
            area: area.trim() ? area : null,
            is_published: isPublished,
            is_sold: isSold,
          }),
        },
      );

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

      router.push("/seller/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <a
        href="/seller/dashboard"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back to dashboard
      </a>

      <h1 className="mt-4 text-2xl font-semibold">Edit product</h1>

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
          <form onSubmit={onSubmit}>
            <label className="block text-sm font-medium">Category</label>
            <select
              className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-medium">Title</label>
            <input
              className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label className="mt-4 block text-sm font-medium">
              Description
            </label>
            <textarea
              className="mt-2 min-h-32 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Currency</label>
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">City</label>
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Addis Ababa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Area / Subcity
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Bole"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isSold}
                  onChange={(e) => setIsSold(e.target.checked)}
                />
                Sold
              </label>
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
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
