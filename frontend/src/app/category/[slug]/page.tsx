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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const [categories, products] = await Promise.all([
    fetchJson<Category[]>(`${apiBaseUrl}/categories`),
    fetchJson<Product[]>(
      `${apiBaseUrl}/products?take=24&category=${encodeURIComponent(slug)}`,
    ),
  ]);

  const category = categories.find((c) => c.slug === slug);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <a
        href="/"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back
      </a>

      <h1 className="mt-4 text-2xl font-semibold">
        {category ? category.name : slug}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.length === 0 ? (
          <div className="text-zinc-600 dark:text-zinc-400">
            No products yet.
          </div>
        ) : (
          products.map((p) => (
            <a
              key={p.id}
              href={`/product/${p.id}`}
              className="rounded-xl border border-black/10 bg-white overflow-hidden hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
            >
              {p.images.length > 0 && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={p.images[0].url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold">
                      {p.title}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {formatLocation(p) ? formatLocation(p) : "—"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-base font-semibold">
                      {p.price} {p.currency}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
