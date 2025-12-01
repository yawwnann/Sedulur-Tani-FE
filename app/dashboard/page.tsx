"use client";

import BannerSlider from "@/components/dashboard/BannerSlider";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import Products from "@/components/dashboard/Products";
import Testimonials from "@/components/dashboard/Testimonials";
import Features from "@/components/dashboard/Features";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Banner */}
      <div>
        <BannerSlider />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <Features />

        {/* Weather Widget Section */}
        <section>
          <WeatherWidget />
        </section>

        {/* Products Section */}
        <Products />

        {/* Testimonials Section */}
        <Testimonials />
      </div>
    </div>
  );
}
