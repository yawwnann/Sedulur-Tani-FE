"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { cartApi } from "@/lib/api";
import logo from "@/public/image/logo.png";

// List kategori produk
const CATEGORIES = [
  { name: "Semua Produk", value: "" },
  { name: "Pupuk Urea", value: "Pupuk Urea" },
  { name: "Pupuk NPK", value: "Pupuk NPK" },
  { name: "Pupuk Kandang", value: "Pupuk Kandang" },
  { name: "Pupuk Kompos", value: "Pupuk Kompos" },
  { name: "Pupuk TSP", value: "Pupuk TSP" },
  { name: "Pupuk KCL", value: "Pupuk KCL" },
  { name: "Pupuk Organik Cair", value: "Pupuk Organik Cair" },
  { name: "Pupuk Hayati", value: "Pupuk Hayati" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/" || pathname === "/dashboard";

  const [user, setUser] = useState<User | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [hideMenuTimeout, setHideMenuTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    // Check user on mount
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        fetchCartCount();
      } else {
        setUser(null);
        setCartCount(0);
      }
    };

    const fetchCartCount = async () => {
      try {
        const response = await cartApi.getCart();
        setCartCount(response.data.data.cart.total_items);
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    };

    loadUser();

    // Listen for storage changes (login/logout)
    window.addEventListener("storage", loadUser);
    // Listen for cart updates
    window.addEventListener("cart-updated", fetchCartCount);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("cart-updated", fetchCartCount);
    };
  }, []);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Scroll listener - only for dashboard
    const handleScroll = () => {
      if (isDashboard) {
        if (window.scrollY > 20) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      } else {
        // Always scrolled (white) on other pages
        setIsScrolled(true);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const handleCategoryClick = (categoryValue: string) => {
    setShowCategoryMenu(false);
    setIsMobileMenuOpen(false);
    if (categoryValue) {
      router.push(`/products?category=${encodeURIComponent(categoryValue)}`);
    } else {
      router.push("/products");
    }
  };

  const handleMouseEnter = () => {
    // Clear any pending timeout
    if (hideMenuTimeout) {
      clearTimeout(hideMenuTimeout);
      setHideMenuTimeout(null);
    }
    setShowCategoryMenu(true);
  };

  const handleMouseLeave = () => {
    // Set timeout to hide menu after 300ms
    const timeout = setTimeout(() => {
      setShowCategoryMenu(false);
    }, 300);
    setHideMenuTimeout(timeout);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-300 ${
          isScrolled
            ? "bg-white text-gray-800 shadow-md"
            : "bg-transparent text-white"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 lg:gap-3">
              <div className="relative">
                <Image
                  src={logo}
                  alt="Sedulur Tani Logo"
                  width={96}
                  height={96}
                  className="w-16 lg:w-24 h-auto"
                />
              </div>
              <div>
                <div
                  className={`text-lg lg:text-2xl font-bold tracking-tight transition-colors ${
                    isScrolled ? "text-[#308A50]" : "text-white"
                  }`}
                >
                  Sedulur Tani
                </div>
                <div
                  className={`text-[10px] lg:text-xs -mt-1 font-medium transition-colors ${
                    isScrolled ? "text-gray-500" : "text-white/80"
                  }`}
                >
                  Pupuk Berkualitas Terbaik
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Home */}
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 group ${
                  isScrolled
                    ? "hover:bg-gray-100 text-gray-700"
                    : "hover:bg-white/10 text-white"
                }`}
              >
                <span className="font-medium">Beranda</span>
              </Link>

              {/* Produk with Dropdown on Hover */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/products"
                  className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-1 ${
                    isScrolled
                      ? "hover:bg-gray-100 text-gray-700"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  <span>Produk</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showCategoryMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>

                {showCategoryMenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-2 gap-1">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => handleCategoryClick(category.value)}
                          className="text-left px-4 py-3 rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 font-medium text-sm flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-500 transition-colors"></span>
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`hidden md:flex items-center px-4 py-2 rounded-full transition-all w-64 focus-within:w-80 ${
                  isScrolled
                    ? "bg-gray-100 border border-gray-300 text-gray-700"
                    : "bg-white/20 backdrop-blur-sm text-white"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m1.4-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Cari pupuk, tanaman..."
                  className={`bg-transparent w-full outline-none placeholder:text-sm ${
                    isScrolled
                      ? "text-gray-800 placeholder-gray-500"
                      : "text-white placeholder-white/70"
                  }`}
                />
              </div>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isScrolled
                        ? "hover:bg-gray-100 text-gray-700"
                        : "hover:bg-white/10 text-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium max-w-[100px] truncate hidden md:block">
                      {user.name}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 mb-2">
                          <p className="text-sm text-gray-500">Masuk sebagai</p>
                          <p className="font-bold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-emerald-600 font-medium capitalize">
                            {user.role === "seller" ? "Penjual" : "Pembeli"}
                          </p>
                        </div>

                        {user.role === "seller" && (
                          <>
                            <Link
                              href="/seller/products"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
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
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                              Produk Saya
                            </Link>
                            <Link
                              href="/orders"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
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
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              Pesanan Masuk
                            </Link>
                          </>
                        )}

                        {user.role === "buyer" && (
                          <>
                            <Link
                              href="/cart"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors justify-between group"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="flex items-center gap-3">
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
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                Keranjang
                              </div>
                              {cartCount > 0 && (
                                <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                  {cartCount}
                                </span>
                              )}
                            </Link>
                            <Link
                              href="/orders"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
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
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                              Pesanan Saya
                            </Link>
                          </>
                        )}

                        <div className="border-t border-gray-100 my-2 pt-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Profil Saya
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
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
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Keluar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isScrolled
                        ? "text-gray-700 hover:text-[#308A50]"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className={`px-6 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
                      isScrolled
                        ? "bg-[#308A50] hover:bg-[#276D3F] text-white"
                        : "bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                    }`}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
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
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Search Bar Mobile */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-300">
              <svg
                className="w-5 h-5 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35m1.4-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari pupuk, tanaman..."
                className="bg-transparent w-full outline-none text-gray-800 placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 p-4 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-medium">Beranda</span>
            </Link>

            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="font-medium">Produk</span>
            </Link>

            <Link
              href="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span className="font-medium">Kategori</span>
            </Link>

            {user ? (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-500">
                    {user.role === "seller" ? "Menu Penjual" : "Menu Pembeli"}
                  </div>
                </div>

                {user.role === "seller" && (
                  <>
                    <Link
                      href="/seller/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                    >
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span className="font-medium">Produk Saya</span>
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                    >
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span className="font-medium">Pesanan</span>
                    </Link>
                  </>
                )}

                {user.role === "buyer" && (
                  <>
                    <Link
                      href="/cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors relative"
                    >
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="font-medium">Keranjang</span>
                      {cartCount > 0 && (
                        <span className="ml-auto bg-[#308A50] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                    >
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
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span className="font-medium">Pesanan</span>
                    </Link>
                  </>
                )}

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium">{user.name}</span>
                </Link>
              </>
            ) : null}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium text-white shadow-md"
              >
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Keluar</span>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-3 rounded-lg font-medium text-center border-2 border-[#308A50] text-[#308A50] hover:bg-[#308A50] hover:text-white transition-colors block"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-[#308A50] hover:bg-[#276D3F] px-4 py-3 rounded-lg font-medium text-white shadow-md text-center block transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
