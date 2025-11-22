'use client';

import BannerSlider from '@/components/BannerSlider';
import WeatherWidget from '@/components/WeatherWidget';
import LayoutGridDemo from '@/components/Dashboard/layout-grid';

export default function Dashboard() {
  return (
    <div>
      {/* Banner Slider */}
      <BannerSlider />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Weather Widget with Real API */}
        <WeatherWidget />


{/* Features Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Keunggulan Sedulur Tani
        </h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#E8F5EC] flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[#308A50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Kualitas Terbaik</h3>
            <p className="text-gray-600">
              Pupuk pilihan langsung dari supplier terpercaya untuk hasil maksimal.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#E8F5EC] flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[#308A50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Harga Terjangkau</h3>
            <p className="text-gray-600">
              Promo menarik setiap bulan dan harga khusus pembelian besar.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#E8F5EC] flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[#308A50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Pengiriman Cepat</h3>
            <p className="text-gray-600">
              Pengiriman cepat ke seluruh Indonesia dengan ekspedisi terpercaya.
            </p>
          </div>

        </div>

      </div>
      <LayoutGridDemo />
    </div>
  );
}
