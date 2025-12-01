"use client";

import { useEffect, useState } from "react";
import { productsApi, categoryApi } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import Toast from "@/components/shared/Toast";
import Image from "next/image";
import { exportToCSV, exportToPDF } from "@/lib/utils/export";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("category", formData.category);
    if (selectedImage) {
      data.append("image", selectedImage);
    }

    try {
      if (isEditing && currentId) {
        await productsApi.update(currentId, data);
        setToast({ message: "Produk berhasil diperbarui", type: "success" });
      } else {
        await productsApi.create(data);
        setToast({ message: "Produk berhasil ditambahkan", type: "success" });
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      setToast({ message: "Gagal menyimpan produk", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await productsApi.delete(id);
        setToast({ message: "Produk berhasil dihapus", type: "success" });
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        setToast({ message: "Gagal menghapus produk", type: "error" });
      }
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
    });
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentId(null);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const handleExportProducts = (format: "csv" | "pdf") => {
    if (products.length === 0) {
      setToast({ message: "Tidak ada data untuk diekspor", type: "error" });
      return;
    }

    try {
      const exportData = products.map((product, index) => ({
        no: index + 1,
        nama: product.name,
        kategori: getCategoryName(product.category),
        harga: product.price,
        stok: product.stock,
        berat: product.weight ? `${product.weight}g` : "-",
      }));

      if (format === "csv") {
        exportToCSV(exportData, `produk-${new Date().toISOString().split("T")[0]}`, [
          { key: "no", label: "No" },
          { key: "nama", label: "Nama Produk" },
          { key: "kategori", label: "Kategori" },
          { key: "harga", label: "Harga (Rp)" },
          { key: "stok", label: "Stok" },
          { key: "berat", label: "Berat" },
        ]);
      } else {
        exportToPDF(
          "Data Produk",
          exportData,
          [
            { key: "nama", label: "Nama Produk" },
            { key: "kategori", label: "Kategori" },
            { key: "harga", label: "Harga" },
            { key: "stok", label: "Stok" },
            { key: "berat", label: "Berat" },
          ],
          [
            { label: "Total Produk", value: products.length.toString() },
            { label: "Stok Rendah (≤10)", value: products.filter(p => p.stock <= 10 && p.stock > 0).length.toString() },
            { label: "Stok Habis", value: products.filter(p => p.stock === 0).length.toString() },
          ]
        );
      }

      setToast({ message: `Data produk berhasil diekspor ke ${format.toUpperCase()}`, type: "success" });
    } catch (error) {
      console.error("Export error:", error);
      setToast({ message: "Gagal mengekspor data", type: "error" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
            <p className="text-gray-500 mt-1">
              Kelola daftar produk, harga, dan stok inventaris Anda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExportProducts("csv")}
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
            <button
              onClick={() => handleExportProducts("pdf")}
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Produk
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Produk</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{products.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stok Tersedia</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stok Rendah</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{products.filter(p => p.stock <= 10).length}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stok Habis</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{products.filter(p => p.stock === 0).length}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data produk...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="group hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 relative">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <svg
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
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
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {getCategoryName(product.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rp {product.price.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`h-2.5 w-2.5 rounded-full mr-2 ${
                              product.stock > 10
                                ? "bg-green-500"
                                : product.stock > 0
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm text-gray-700">
                            {product.stock} unit
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg
                          className="w-20 h-20 mb-4 text-gray-300"
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
                        <p className="text-lg font-semibold text-gray-900">
                          Belum ada produk
                        </p>
                        <p className="text-sm text-gray-500 mt-2 mb-4">
                          Mulai dengan menambahkan produk baru ke inventaris Anda.
                        </p>
                        <button
                          onClick={openCreateModal}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Tambah Produk Pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Isi informasi detail produk di bawah ini
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
              >
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
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="Contoh: Beras Organik Pandan Wangi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga (Rp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        Rp
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="Deskripsi lengkap produk..."
                      rows={4}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar Produk
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-emerald-500 transition-colors bg-gray-50">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                          >
                            <span>Upload file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </label>
                          <p className="pl-1">atau drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        {selectedImage && (
                          <p className="text-sm text-emerald-600 font-medium mt-2">
                            File terpilih: {selectedImage.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-white hover:shadow-sm font-medium transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                form="productForm"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-all shadow-lg shadow-emerald-600/20"
              >
                {isEditing ? "Simpan Perubahan" : "Simpan Produk"}
              </button>
            </div>
          </div>
        </div>
      )}

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
