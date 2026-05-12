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

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!isOpen) return null;

  const formatLocation = (p: Product) => {
    const city = p.city?.trim() ? p.city.trim() : "";
    const area = p.area?.trim() ? p.area.trim() : "";
    const locationText = p.location_text?.trim() ? p.location_text.trim() : "";
    if (locationText) return locationText;
    if (city && area) return `${city} - ${area}`;
    return city || area || "";
  };

  const phoneHref = product.seller.phone ? `tel:${product.seller.phone}` : null;
  const telegramHref = product.seller.telegram_username
    ? `https://t.me/${product.seller.telegram_username.replace(/^@/, "")}`
    : null;
  const whatsappHref = product.seller.phone
    ? `https://wa.me/${product.seller.phone.replace(/[^\d]/g, "")}`
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 dark:bg-gray-700/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Product Image */}
          {product.images.length > 0 && (
            <div className="relative h-96 md:h-[500px] overflow-hidden rounded-t-3xl">
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              
              {/* Seller Avatar Overlay */}
              <div className="absolute top-4 left-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-lg">
                    {product.seller.avatar ? (
                      <img
                        src={product.seller.avatar}
                        alt={product.seller.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {product.seller.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-4 left-24">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {product.category.name}
                </span>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="p-6 md:p-8">
            {/* Title and Price */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {product.price}
                </span>
                <span className="text-xl text-gray-500 dark:text-gray-400">
                  {product.currency}
                </span>
              </div>
              {formatLocation(product) && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{formatLocation(product)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Seller Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Seller Information</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
                  {product.seller.avatar ? (
                    <img
                      src={product.seller.avatar}
                      alt={product.seller.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {product.seller.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {product.seller.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verified Seller</p>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-wrap gap-3">
                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </a>
                )}

                {telegramHref && (
                  <a
                    href={telegramHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.2 1.98-1.05 6.78-1.48 9-.19.95-.55 1.27-.9 1.3-.75.07-1.33-.5-2.05-.97-.88-.57-1.38-.88-2.23-1.43-.98-.64-.35-1 .21-1.57.15-.15 2.68-2.45 2.68-2.45s.1-.07-.07-.2c-.17-.13-.15-.11-.3-.11s-.2.13-.35.28c-.15.15-2.48 2.38-3.18 3.08-.83.82-1.58.77-2.32.75-.78-.02-2.25-.28-2.62-.5-.37-.22-.2-.45.17-.58 1.83-.63 6.23-2.43 7.98-3.18 1.13-.5 2.13-.73 2.78-.73.45 0 1.3.27 1.38 1.03z"/>
                    </svg>
                    Telegram
                  </a>
                )}

                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}

                {!phoneHref && !telegramHref && !whatsappHref && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Seller contact information not available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
