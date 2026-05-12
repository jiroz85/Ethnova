type Product = {
  id: string;
  title: string;
  description: string;
  price: string | number;
  currency: string;
  city?: string | null;
  area?: string | null;
  location_text: string | null;
  created_at: string;
  category: { id: string; name: string; slug: string };
  seller: {
    id: string;
    full_name: string;
    phone: string | null;
    telegram_username: string | null;
    whatsapp: string | null;
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const product = await fetchJson<Product>(
    `${apiBaseUrl}/products/${encodeURIComponent(id)}`,
  );

  const phoneHref = product.seller.phone ? `tel:${product.seller.phone}` : null;
  const telegramHref = product.seller.telegram_username
    ? `https://t.me/${product.seller.telegram_username.replace(/^@/, "")}`
    : null;
  const whatsappHref = product.seller.phone
    ? `https://wa.me/${product.seller.phone.replace(/[^\d]/g, "")}`
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <a
        href={
          product.category?.slug ? `/category/${product.category.slug}` : "/"
        }
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back
      </a>

      <div className="mt-4 rounded-2xl border border-black/10 bg-white dark:bg-black dark:border-white/10">
        {product.images.length > 0 && (
          <div className="aspect-square w-full overflow-hidden rounded-t-2xl">
            <img
              src={product.images[0].url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {product.category.name}
            {formatLocation(product) ? ` • ${formatLocation(product)}` : ""}
          </div>

          <h1 className="mt-2 text-2xl font-semibold">{product.title}</h1>

          <div className="mt-4 text-xl font-semibold">
            {product.price} {product.currency}
          </div>

          <p className="mt-4 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
            {product.description}
          </p>

          <div className="mt-6 rounded-xl bg-zinc-50 p-4 dark:bg-white/5">
            <div className="text-sm font-semibold">Seller</div>
            <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              <a
                className="hover:underline"
                href={`/shop/${product.seller.id}`}
              >
                {product.seller.full_name}
              </a>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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

              {whatsappHref ? (
                <a
                  className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:bg-black dark:border-white/10 dark:hover:bg-white/5"
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>

            {!phoneHref && !telegramHref && !whatsappHref ? (
              <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Seller contact info not available.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
