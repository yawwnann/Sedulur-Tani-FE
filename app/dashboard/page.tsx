'use client';

import Link from 'next/link';
import Image from 'next/image';
import BannerSlider from '@/components/BannerSlider';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import InfiniteMovingCards from '@/components/ui/infinite-moving-cards';

export default function Dashboard() {
  const features = [
    {
      title: 'Kualitas Terbaik',
      desc: 'Pupuk pilihan langsung dari supplier terpercaya untuk hasil maksimal.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    },
    {
      title: 'Harga Terjangkau',
      desc: 'Promo menarik setiap bulan dan harga khusus pembelian besar.',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    {
      title: 'Pengiriman Cepat',
      desc: 'Pengiriman cepat ke seluruh Indonesia dengan ekspedisi terpercaya.',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
    },
  ];

  const products = [
    {
      img: 'https://via.placeholder.com/300?text=Pupuk+Urea',
      name: 'Pupuk Urea 50kg',
      desc: 'Pupuk urea berkualitas tinggi untuk pertumbuhan optimal tanaman',
      price: 'Rp 250.000',
      stock: 100,
    },
    {
      img: 'https://via.placeholder.com/300?text=Pupuk+NPK',
      name: 'Pupuk NPK Phonska 50kg',
      desc: 'Pupuk lengkap dengan nitrogen, fosfor, dan kalium',
      price: 'Rp 320.000',
      stock: 85,
    },
    {
      img: 'https://via.placeholder.com/300?text=Pupuk+Organik',
      name: 'Pupuk Organik Kompos 40kg',
      desc: 'Pupuk organik alami ramah lingkungan',
      price: 'Rp 150.000',
      stock: 120,
    },
    {
      img: 'https://via.placeholder.com/300?text=Pupuk+ZA',
      name: 'Pupuk ZA 50kg',
      desc: 'Pupuk ZA untuk meningkatkan kadar nitrogen tanah',
      price: 'Rp 180.000',
      stock: 95,
    },
  ];

  const testimonials = [
    { 
      quote: 'Kualitas pupuk sangat baik, hasil panen meningkat drastis!', 
      name: 'Pak Suharto', 
      title: 'Petani Padi' 
    },
    { 
      quote: 'Pelayanan cepat dan harga terjangkau. Sangat merekomendasikan!', 
      name: 'Bu Sari', 
      title: 'Petani Sayuran' 
    },
    { 
      quote: 'Pupuk organik terbaik yang pernah saya gunakan.', 
      name: 'Pak Joko', 
      title: 'Petani Buah' 
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Banner */}
      <div className="-mt-16 pt-16">
        <BannerSlider />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features Section */}
        <section className="py-8 lg:py-13">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Keunggulan Sedulur Tani
            </h2>
            <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">
              Solusi terpercaya untuk kebutuhan pertanian modern dengan layanan terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group"
              >
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{item.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Weather Widget Section */}
        <section >
          <WeatherWidget />
        </section>

        {/* Products Section */}
        <section className=" ">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Produk Pilihan</h2>
              <p className="text-gray-600">Pilihan terbaik untuk kebutuhan pertanian Anda</p>
            </div>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group"
            >
              Lihat Semua Produk
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 overflow-hidden group"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <Image 
                    src={product.img} 
                    alt={product.name} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-14">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-10">
                    {product.desc}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-emerald-600 text-xl font-bold">{product.price}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Stok: {product.stock}
                    </span>
                  </div>

                  <button className="w-full bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow-md">
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 lg:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Testimoni Pelanggan</h2>
            <p className="text-gray-600">Apa kata mereka tentang Sedulur Tani</p>
          </div>
          
          <InfiniteMovingCards items={testimonials} />
        </section>
      </div>
    </div>
  );
}
