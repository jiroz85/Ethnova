"use client";

import { useState } from "react";

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
    avatar?: string | null;
  };
  images: { id: string; url: string }[];
};

export default function SearchBar({
  onResults,
  categories,
}: {
  onResults: (products: Product[]) => void;
  categories: Category[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSearch = () => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
    const params = new URLSearchParams();

    if (searchTerm.trim()) params.append("search", searchTerm.trim());
    if (selectedCategory) params.append("category", selectedCategory);
    params.append("take", "24");

    const url = `${apiBaseUrl}/products?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data: Product[]) => onResults(data))
      .catch((err) => console.error("Search failed:", err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
      <input
        type="text"
        placeholder="Search for shoes, phones, clothes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 rounded-lg border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground dark:bg-white/5 dark:border-white/10"
      />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="rounded-lg border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground dark:bg-white/5 dark:border-white/10"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background"
      >
        Search
      </button>
    </form>
  );
}
