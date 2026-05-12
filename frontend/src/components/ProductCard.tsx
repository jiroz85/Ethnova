import { useState } from "react";
import ProductModal from "./ProductModal";

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
  description?: string | null;
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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatLocation = (p: Product) => {
    const city = p.city?.trim() ? p.city.trim() : "";
    const area = p.area?.trim() ? p.area.trim() : "";
    const locationText = p.location_text?.trim() ? p.location_text.trim() : "";
    if (locationText) return locationText;
    if (city && area) return `${city} - ${area}`;
    return city || area || "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const contactMethods = [];
  if (product.seller.phone) contactMethods.push("Phone");
  if (product.seller.telegram_username) contactMethods.push("Telegram");

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="block group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500 transform hover:-translate-y-1"
      >
        {/* Image Section */}
        <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
              <svg
                className="w-16 h-16 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Seller Avatar */}
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg">
                {product.seller.avatar ? (
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {product.seller.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-24">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              {product.category.name}
            </span>
          </div>

          {/* Contact Methods Badge */}
          {contactMethods.length > 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {contactMethods.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>

          {/* Description Preview */}
          {product.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {product.price}
              </span>
              <span className="text-lg text-gray-500 dark:text-gray-400">
                {product.currency}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(product.created_at)}
            </div>
          </div>

          {/* Location */}
          {formatLocation(product) && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm">{formatLocation(product)}</span>
            </div>
          )}

          {/* Seller Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {product.seller.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.seller.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Verified Seller
                </p>
              </div>
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
