"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = localStorage.getItem("ethnova_access_token");
      const userData = localStorage.getItem("ethnova_user");

      if (token && userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Listen for storage changes (for logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ethnova_access_token" || e.key === "ethnova_user") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ethnova_access_token");
    localStorage.removeItem("ethnova_user");
    setUser(null);
    router.push("/");
  };

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
              {!user && (
                <>
                  <a
                    href="#home"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
                  >
                    Home
                  </a>
                  <a
                    href="#shop"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
                  >
                    Shop
                  </a>
                  <a
                    href="#categories"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
                  >
                    Categories
                  </a>
                  <a
                    href="#about"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
                  >
                    About
                  </a>
                  <a
                    href="#contact"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
                  >
                    Contact
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
                  >
                    Admin
                  </Link>
                )}
                {user.role === "seller" && (
                  <Link
                    href="/seller/dashboard"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-white dark:hover:text-blue-400"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-red-400 dark:hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/seller/login"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Seller Login
              </Link>
            )}
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
            {!user && (
              <>
                <a
                  href="#home"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#shop"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop
                </a>
                <a
                  href="#categories"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </a>
                <a
                  href="#about"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
              </>
            )}
            {user ? (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.role === "seller" && (
                  <Link
                    href="/seller/dashboard"
                    className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium dark:text-white dark:hover:text-blue-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Seller Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-red-600 hover:text-red-700 block px-3 py-2 rounded-md text-base font-medium dark:text-red-400 dark:hover:text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/seller/login"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white block px-3 py-2 rounded-md text-base font-medium mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Seller Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
