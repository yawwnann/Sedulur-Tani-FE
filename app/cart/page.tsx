"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cartApi } from "@/lib/api";
import { CartItem, Cart } from "@/lib/types";

import Toast from "@/components/Toast";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      setCart(response.data.data.cart);
    } catch (error: any) {
      console.error("Failed to fetch cart:", error);
      if (error.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems((prev) => [...prev, itemId]);
      await cartApi.updateItem(itemId, { quantity: newQuantity });

      // Update local state optimistically or refetch
      // Here we'll refetch to ensure calculations are correct from backend
      await fetchCart();

      // Notify navbar to update cart count
      window.dispatchEvent(new Event("cart-updated"));
      setToast({
        message: "Jumlah produk berhasil diperbarui",
        type: "success",
      });
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      setToast({
        message: error.response?.data?.message || "Gagal mengupdate keranjang",
        type: "error",
      });
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItems((prev) => [...prev, itemId]);
      await cartApi.removeItem(itemId);
      await fetchCart();
      window.dispatchEvent(new Event("cart-updated"));
      setToast({
        message: "Produk berhasil dihapus dari keranjang",
        type: "success",
      });
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      setToast({
        message: error.response?.data?.message || "Gagal menghapus item",
        type: "error",
      });
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-2xl p-6 h-64"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Keranjang Belanja
        </h1>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-emerald-600"
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
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Keranjang Anda Kosong
            </h2>
            <p className="text-gray-500 mb-8">
              Wah, keranjang belanjaanmu masih kosong nih. Yuk isi dengan
              produk-produk segar!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 sm:gap-6"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={
                        item.product.image_url ||
                        "https://via.placeholder.com/150?text=No+Image"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {item.product.seller?.name || "Penjual"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingItems.includes(item.id)}
                        className="ml-4 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all disabled:opacity-50 shrink-0"
                        title="Hapus dari keranjang"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={
                            item.quantity <= 1 ||
                            updatingItems.includes(item.id)
                          }
                          className="px-3 py-1 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.product.stock ||
                            updatingItems.includes(item.id)
                          }
                          className="px-3 py-1 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Harga</p>
                        <p className="text-lg font-bold text-emerald-600">
                          Rp{" "}
                          {(item.product.price * item.quantity).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-96">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Item ({cart.total_items})</span>
                    <span>Rp {cart.total_price.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total Harga</span>
                    <span className="text-emerald-600">
                      Rp {cart.total_price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-emerald-600 text-white py-3.5 rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 flex items-center justify-center gap-2"
                >
                  Beli Sekarang
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
