"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { productsApi, cartApi } from "@/lib/api";
import { Product, PaginationMeta } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Read category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const itemsPerPage = 12;

  // Sort
  const [sortBy, setSortBy] = useState("newest");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        in_stock: true,
        page: currentPage,
        limit: itemsPerPage,
      };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);

      const response = await productsApi.getAll(params);
      let fetchedProducts = response.data.data?.products || [];
      const paginationData = response.data.data?.pagination;

      // Sort products locally (client-side)
      if (sortBy === "price_low") {
        fetchedProducts = [...fetchedProducts].sort(
          (a, b) => (a.price || 0) - (b.price || 0)
        );
      } else if (sortBy === "price_high") {
        fetchedProducts = [...fetchedProducts].sort(
          (a, b) => (b.price || 0) - (a.price || 0)
        );
      } else if (sortBy === "name") {
        fetchedProducts = [...fetchedProducts].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      }

      setProducts(fetchedProducts);

      // Use backend pagination if available
      if (paginationData) {
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search and reset page on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category, minPrice, maxPrice, sortBy]);

  // Fetch when page changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setAddingToCart(productId);
      await cartApi.addToCart({
        productId: productId,
        quantity: 1,
      });
      alert("Produk berhasil ditambahkan ke keranjang!");
      // Refresh cart count in navbar (handled by window storage event or context usually,
      // but for now we rely on page refresh or simple alert)
      window.dispatchEvent(new Event("storage"));
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      alert(error.response?.data?.message || "Gagal menambahkan ke keranjang");
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {category ? `Produk ${category}` : "Semua Produk"}
          </h1>
          {category && (
            <button
              onClick={() => {
                setCategory("");
                router.push("/products");
              }}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-4"
            >
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Semua Produk
            </button>
          )}

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="number"
                  placeholder="Min Harga"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <span className="self-center text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max Harga"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Sort and Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-sm text-gray-600">
                {products.length > 0 && (
                  <span>
                    Menampilkan {products.length} produk
                    {pagination && ` dari ${pagination.total} total`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600">
                  Urutkan:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                >
                  <option value="newest">Terbaru</option>
                  <option value="name">Nama (A-Z)</option>
                  <option value="price_low">Harga Terendah</option>
                  <option value="price_high">Harga Tertinggi</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-4/5 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 overflow-hidden group flex flex-col"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="block relative aspect-4/5 bg-gray-100 overflow-hidden"
                >
                  <Image
                    src={
                      product.image_url ||
                      "https://via.placeholder.com/300?text=No+Image"
                    }
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </Link>

                <div className="p-4 flex flex-col grow">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 grow">
                    {product.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-emerald-600 text-lg font-bold">
                        Rp {(product.price || 0).toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Stok: {product.stock || 0}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 bg-white text-emerald-600 border-2 border-emerald-600 py-2 rounded-lg hover:bg-emerald-50 transition-colors font-medium shadow-sm text-center"
                      >
                        Detail
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={
                          addingToCart === product.id ||
                          (product.stock || 0) === 0
                        }
                        title={
                          (product.stock || 0) === 0
                            ? "Stok Habis"
                            : "Tambah ke Keranjang"
                        }
                        className="w-10 h-10 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {addingToCart === product.id ? (
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
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
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Produk tidak ditemukan
            </h3>
            <p className="text-gray-500">
              Coba ubah kata kunci pencarian atau filter harga Anda.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading &&
          products.length > 0 &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and adjacent pages
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center gap-2">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? "bg-emerald-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.totalPages, prev + 1)
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
