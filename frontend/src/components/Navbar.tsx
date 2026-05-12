"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg dark:bg-black dark:border-b dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Ethnova Marketplace
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
              >
                Shop
              </Link>
              <Link
                href="/categories"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Seller Login Button */}
          <div className="hidden md:block">
            <Link
              href="/seller/login"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Seller Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-white dark:hover:text-blue-400 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-black border-t dark:border-white/10">
            <Link
              href="/"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/categories"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/seller/login"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white block px-3 py-2 rounded-md text-base font-medium mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Seller Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
