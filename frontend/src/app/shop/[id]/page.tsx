import Link from "next/link";

type Seller = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  telegram_username: string | null;
  created_at: string;
};

type Category = { id: string; name: string; slug: string };

type Product = {
  id: string;
  title: string;
  price: string | number;
  currency: string;
  city?: string | null;
  area?: string | null;
  location_text: string | null;
  created_at: string;
  category: Category;
  images: { id: string; url: string }[];
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

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const [seller, products] = await Promise.all([
    fetchJson<Seller>(`${apiBaseUrl}/sellers/${encodeURIComponent(id)}`),
    fetchJson<Product[]>(
      `${apiBaseUrl}/sellers/${encodeURIComponent(id)}/products`,
    ),
  ]);

  const telegramHref = seller.telegram_username
    ? `https://t.me/${seller.telegram_username.replace(/^@/, "")}`
    : null;
  const phoneHref = seller.phone ? `tel:${seller.phone}` : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back
      </Link>

      <div className="mt-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:bg-black dark:border-white/10">
        <h1 className="text-2xl font-semibold">{seller.full_name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          {phoneHref ? (
            <a
              className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
              href={phoneHref}
            >
              Call
            </a>
          ) : null}

          {telegramHref ? (
            <a
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
              href={telegramHref}
              target="_blank"
              rel="noreferrer"
            >
              Telegram
            </a>
          ) : null}
        </div>

        {!phoneHref && !telegramHref ? (
          <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Seller contact info not available.
          </div>
        ) : null}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Products</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.length === 0 ? (
          <div className="text-zinc-600 dark:text-zinc-400">
            No products yet.
          </div>
        ) : (
          products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="rounded-xl border border-black/10 bg-white p-4 hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">
                    {p.title}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {p.category.name}
                    {formatLocation(p) ? ` • ${formatLocation(p)}` : ""}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-base font-semibold">
                    {p.price} {p.currency}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
