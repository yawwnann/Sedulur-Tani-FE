'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ordersApi } from '@/lib/api';
import { Order } from '@/lib/types';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
      setOrders(response.data.data.orders || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      processed: 'bg-blue-100 text-blue-700 border-blue-200',
      shipped: 'bg-purple-100 text-purple-700 border-purple-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Menunggu Pembayaran',
      processed: 'Diproses',
      shipped: 'Dikirim',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-48"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum ada pesanan</h2>
            <p className="text-gray-500 mb-8">Mulai belanja sayur dan buah segar sekarang.</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(order.created_at).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <span>ID: {order.id}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={order.product?.image_url || "https://via.placeholder.com/150?text=No+Image"}
                        alt={order.product?.name || "Product"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{order.product?.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">
                        {order.quantity} barang x Rp {order.price_each.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-gray-500 mb-1">Total Belanja</p>
                      <p className="font-bold text-emerald-600 text-lg">
                        Rp {order.total_price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center md:hidden">
                    <span className="text-sm font-medium text-gray-900">Total Belanja</span>
                    <span className="font-bold text-emerald-600">
                      Rp {order.total_price.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                
                {order.status === 'completed' && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      Beli Lagi
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
