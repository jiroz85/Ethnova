"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };

type CreateProductResponse = {
  id: string;
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

export default function SellerNewProductPage() {
  const router = useRouter();

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  const [token] = useState<string | null>(() => {
    try {
      return localStorage.getItem("ethnova_access_token");
    } catch {
      return null;
    }
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
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
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/seller/login");
      return;
    }

    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch(`${apiBaseUrl}/categories`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Request failed (HTTP ${res.status})`);
        const data = (await res.json()) as Category[];
        setCategories(Array.isArray(data) ? data : []);
        if (!categoryId && Array.isArray(data) && data[0]?.id) {
          setCategoryId(data[0].id);
        }
      } finally {
        setLoadingCategories(false);
      }
    }

    void loadCategories();
  }, [apiBaseUrl, router, token, categoryId]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiBaseUrl}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("ethnova_access_token");
        localStorage.removeItem("ethnova_user");
        router.replace("/seller/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(getErrorMessage(data, "Upload failed"));
      }

      const result = await res.json();
      setImages((prev) => [...prev, result.image.url]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

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

      const res = await fetch(`${apiBaseUrl}/products`, {
        method: "POST",
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
          city: city.trim() ? city : undefined,
          area: area.trim() ? area : undefined,
          is_published: isPublished,
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
          getErrorMessage(data, `Create failed (HTTP ${res.status})`),
        );
      }

      const created = data as CreateProductResponse;

      // Upload images if any
      if (images.length > 0) {
        for (const imageUrl of images) {
          await fetch(`${apiBaseUrl}/products/${created.id}/images`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url: imageUrl,
              sort_order: images.indexOf(imageUrl),
            }),
          });
        }
      }

      router.push(`/product/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product");
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

      <h1 className="mt-4 text-2xl font-semibold">Add new product</h1>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:bg-black dark:border-white/10"
      >
        <label className="block text-sm font-medium">Category</label>
        <select
          className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={loadingCategories}
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

        <label className="mt-4 block text-sm font-medium">Description</label>
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
            <label className="block text-sm font-medium">Area / Subcity</label>
            <input
              className="mt-2 w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm outline-none dark:bg-white/5 dark:border-white/10"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Bole"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Product Images</label>
          <div className="mt-2">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-foreground file:py-2 file:px-4 file:text-sm file:font-medium file:text-background dark:file:bg-white dark:file:text-black"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Upload up to 5 images. JPEG, PNG, or WebP format. Max 5MB each.
            </p>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploadingImage && (
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Uploading image...
            </div>
          )}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Publish immediately
        </label>

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
          {submitting ? "Creating…" : "Create product"}
        </button>
      </form>
    </div>
  );
}
