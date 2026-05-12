import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <header className="border-b border-black/10 bg-white dark:bg-black dark:border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/vercel.svg"
              alt="Logo"
              width={20}
              height={20}
              style={{ width: "auto", height: "auto" }}
            />
            <span className="text-lg font-semibold">Ethnova Marketplace</span>
          </div>
          <a
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
            href="/seller/login"
          >
            Seller Login
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <HomeContent />
      </main>
    </div>
  );
}

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
  seller: {
    id: string;
    full_name: string;
    phone: string | null;
    telegram_username: string | null;
  };
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

async function HomeContent() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const [categories, products] = await Promise.all([
    fetchJson<Category[]>(`${apiBaseUrl}/categories`),
    fetchJson<Product[]>(`${apiBaseUrl}/products?take=12`),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-black dark:border dark:border-white/10">
        <h1 className="text-2xl font-semibold">Browse categories</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`/category/${c.slug}`}
              className="rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm font-medium hover:bg-zinc-100 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
            >
              {c.name}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-black dark:border dark:border-white/10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Latest products</h2>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Contact sellers directly
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <a
              key={p.id}
              href={`/product/${p.id}`}
              className="rounded-xl border border-black/10 p-4 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5"
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
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
