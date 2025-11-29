'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import logo from '@/public/image/logo.png';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  });
  const [cartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Scroll listener
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-300 ${
        isScrolled 
          ? 'bg-white text-gray-800 shadow-md' 
          : 'bg-transparent text-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="relative">
          <Image src={logo} alt="Sedulur Tani Logo" width={96} height={96} className="w-24 h-auto" />
        </div>
        <div>
                <div className={`text-2xl font-bold tracking-tight transition-colors ${
                  isScrolled ? 'text-[#308A50]' : 'text-white'
                }`}>Sedulur Tani</div>
                <div className={`text-xs -mt-1 font-medium transition-colors ${
                  isScrolled ? 'text-gray-500' : 'text-white/80'
                }`}>Pupuk Berkualitas Terbaik</div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {/* Home */}
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 group ${
                  isScrolled 
                    ? 'hover:bg-gray-100 text-gray-700' 
                    : 'hover:bg-white/10 text-white'
                }`}
              >
                
                <span className="hidden md:inline font-medium">Beranda</span>
              </Link>
              <Link 
                  href="/products" 
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    isScrolled ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white'
                  }`}
                >
                  Produk
                </Link>

                <Link 
                  href="/categories" 
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    isScrolled ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white'
                  }`}
                >
                  Kategori
                </Link>

                <div 
                    className={`hidden md:flex items-center px-4 py-2 rounded-full transition-all w-64 focus-within:w-80 ${
                      isScrolled 
                        ? 'bg-gray-100 border border-gray-300 text-gray-700'
                        : 'bg-white/20 backdrop-blur-sm text-white'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.4-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
                    </svg>
                    <input 
                      type="text"
                      placeholder="Cari pupuk, tanaman..."
                      className={`bg-transparent w-full outline-none placeholder:text-sm ${
                        isScrolled ? 'text-gray-800 placeholder-gray-500' : 'text-white placeholder-white/70'
                      }`}
                    />
                  </div>

              {user ? (
                <>
                  {/* Seller Menu */}
                  {user.role === 'seller' && (
                    <>
                      <Link 
                        href="/seller/products" 
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 group ${
                          isScrolled 
                            ? 'hover:bg-gray-100 text-gray-700' 
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="hidden md:inline font-medium">Produk Saya</span>
                      </Link>
                      <Link 
                        href="/orders" 
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 group ${
                          isScrolled 
                            ? 'hover:bg-gray-100 text-gray-700' 
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="hidden md:inline font-medium">Pesanan</span>
                      </Link>
                    </>
                  )}

                  {/* Buyer Menu */}
                  {user.role === 'buyer' && (
                    <>
                      <Link 
                        href="/cart" 
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 relative group ${
                          isScrolled 
                            ? 'hover:bg-gray-100 text-gray-700' 
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="hidden md:inline font-medium">Keranjang</span>
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-[#308A50] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                      <Link 
                        href="/orders" 
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 group ${
                          isScrolled 
                            ? 'hover:bg-gray-100 text-gray-700' 
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="hidden md:inline font-medium">Pesanan</span>
                      </Link>
                    </>
                  )}

                  {/* Profile */}
                  <Link 
                    href="/profile" 
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 group ${
                      isScrolled 
                        ? 'hover:bg-gray-100 text-gray-700' 
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden lg:inline font-medium max-w-[100px] truncate">{user.name}</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-medium text-white shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden md:inline">Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-[#308A50]' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className={`px-6 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
                      isScrolled 
                        ? 'bg-[#308A50] hover:bg-[#276D3F] text-white' 
                        : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                    }`}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>


    </>
  );
}