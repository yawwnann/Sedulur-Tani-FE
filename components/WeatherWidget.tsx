'use client';

import { useState, useEffect } from 'react';
import { fetchWeatherApi } from 'openmeteo';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  locationName: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);


  const getWeatherData = async () => {
    setLoading(true);
    setError(null);
    setLocationDenied(false);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda');
      setLoading(false);
      return;
    }

    // Request user location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Fetch weather data from Open-Meteo API
          const params = {
            latitude: latitude,
            longitude: longitude,
            current: [
              'temperature_2m',
              'relative_humidity_2m',
              'precipitation',
              'weather_code',
              'wind_speed_10m'
            ],
            timezone: 'Asia/Jakarta'
          };
          
          const url = 'https://api.open-meteo.com/v1/forecast';
          const responses = await fetchWeatherApi(url, params);
          const response = responses[0];
          
          // Get current weather data
          const current = response.current()!;
          
          // Get location name using reverse geocoding
          let locationName = 'Lokasi Anda';
          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const geoData = await geoResponse.json();
            locationName = geoData.address?.city || geoData.address?.county || geoData.address?.state || 'Lokasi Anda';
          } catch (err) {
            console.error('Error fetching location name:', err);
          }

          setWeather({
            temperature: Math.round(current.variables(0)!.value()),
            humidity: Math.round(current.variables(1)!.value()),
            precipitation: Math.round(current.variables(2)!.value()),
            weatherCode: current.variables(3)!.value(),
            windSpeed: Math.round(current.variables(4)!.value()),
            locationName
          });
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching weather:', err);
          setError('Gagal mengambil data cuaca');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationDenied(true);
        setError('Akses lokasi ditolak. Silakan izinkan akses lokasi untuk melihat cuaca.');
        setLoading(false);
      }
    );
  };
  
  useEffect(() => {
    const fetchInitialWeatherData = async () => {
      setLoading(true);
      setError(null);
      setLocationDenied(false);

      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setError('Geolocation tidak didukung oleh browser Anda');
        setLoading(false);
        return;
      }

      // Request user location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Fetch weather data from Open-Meteo API
            const params = {
              latitude: latitude,
              longitude: longitude,
              current: [
                'temperature_2m',
                'relative_humidity_2m',
                'precipitation',
                'weather_code',
                'wind_speed_10m'
              ],
              timezone: 'Asia/Jakarta'
            };
            
            const url = 'https://api.open-meteo.com/v1/forecast';
            const responses = await fetchWeatherApi(url, params);
            const response = responses[0];
            
            // Get current weather data
            const current = response.current()!;
            
            // Get location name using reverse geocoding
            let locationName = 'Lokasi Anda';
            try {
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
              );
              const geoData = await geoResponse.json();
              locationName = geoData.address?.city || geoData.address?.county || geoData.address?.state || 'Lokasi Anda';
            } catch (err) {
              console.error('Error fetching location name:', err);
            }

            setWeather({
              temperature: Math.round(current.variables(0)!.value()),
              humidity: Math.round(current.variables(1)!.value()),
              precipitation: Math.round(current.variables(2)!.value()),
              weatherCode: current.variables(3)!.value(),
              windSpeed: Math.round(current.variables(4)!.value()),
              locationName
            });
            
            setLoading(false);
          } catch (err) {
            console.error('Error fetching weather:', err);
            setError('Gagal mengambil data cuaca');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocationDenied(true);
          setError('Akses lokasi ditolak. Silakan izinkan akses lokasi untuk melihat cuaca.');
          setLoading(false);
        }
      );
    };

    fetchInitialWeatherData();
  }, []);


  const getWeatherIcon = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌦️';
    if (code <= 86) return '🌨️';
    if (code <= 99) return '⛈️';
    return '☁️';
  };

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Cerah';
    if (code <= 3) return 'Berawan Cerah';
    if (code <= 48) return 'Berkabut';
    if (code <= 67) return 'Hujan';
    if (code <= 77) return 'Salju';
    if (code <= 82) return 'Hujan Ringan';
    if (code <= 86) return 'Hujan Salju';
    if (code <= 99) return 'Badai Petir';
    return 'Berawan';
  };

  const getFertilizationRecommendation = () => {
    if (!weather) return null;

    const isGoodCondition = weather.precipitation < 30 && weather.windSpeed < 20;
    
    return {
      isGood: isGoodCondition,
      type: isGoodCondition ? 'Pemupukan Butiran' : 'Tunda Pemupukan',
      subtitle: isGoodCondition ? '(NPK / Urea)' : '(Tunggu Cuaca Membaik)',
      tips: [
        {
          icon: isGoodCondition ? 'check' : 'warning',
          text: isGoodCondition 
            ? 'Cuaca stabil, minim angin kencang' 
            : 'Angin kencang atau hujan, tunda pemupukan'
        },
        {
          icon: weather.precipitation > 30 ? 'warning' : 'check',
          text: weather.precipitation > 30
            ? 'Peluang hujan tinggi, hindari pemupukan'
            : 'Hindari pupuk cair jika hujan'
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Informasi Cuaca Hari Ini
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          {/* Main Weather Card Skeleton */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <div className="h-16 bg-gray-300 rounded w-24"></div>
                <div className="h-10 bg-gray-300 rounded w-12"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-36"></div>
            </div>

            {/* Weather Details Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-6 h-6 bg-gray-300 rounded mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-5 bg-gray-300 rounded w-12 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Card Skeleton */}
          <div className="bg-[#308A50] text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="h-6 bg-white/20 rounded w-32"></div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="h-4 bg-white/20 rounded w-28 mb-2"></div>
              <div className="h-5 bg-white/20 rounded w-36 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-24"></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-white/20 rounded flex-shrink-0"></div>
                <div className="h-4 bg-white/20 rounded flex-1"></div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-white/20 rounded flex-shrink-0"></div>
                <div className="h-4 bg-white/20 rounded flex-1"></div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="h-3 bg-white/20 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Informasi Cuaca Hari Ini
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-700 mb-4">{error}</p>
          {locationDenied && (
            <button
              onClick={getWeatherData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const recommendation = getFertilizationRecommendation();
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Informasi Cuaca Hari Ini
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Weather Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">{weather.locationName}</p>
              <p className="text-gray-500 text-xs">Terakhir diperbarui: {currentTime} WIB</p>
            </div>
            <div className="text-7xl">{getWeatherIcon(weather.weatherCode)}</div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-gray-800">{weather.temperature}</span>
              <span className="text-3xl text-gray-600">°C</span>
            </div>
            <p className="text-xl text-gray-700 mt-2 font-medium">{getWeatherDescription(weather.weatherCode)}</p>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
              <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <p className="text-xs text-gray-500 mb-1">Kelembapan</p>
              <p className="text-lg font-bold text-gray-800">{weather.humidity}%</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
              <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <p className="text-xs text-gray-500 mb-1">Angin</p>
              <p className="text-lg font-bold text-gray-800">{weather.windSpeed} km/h</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
              <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <p className="text-xs text-gray-500 mb-1">Curah Hujan</p>
              <p className="text-lg font-bold text-gray-800">{weather.precipitation}%</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
              <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
              <p className="text-xs text-gray-500 mb-1">Kondisi</p>
              <p className="text-sm font-bold text-gray-800">{recommendation?.isGood ? 'Baik' : 'Kurang'}</p>
            </div>
          </div>
        </div>

        {/* Recommendation Card */}
        {recommendation && (
          <div className="bg-[#308A50] text-white rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Saran Pemupukan</h3>
            </div>

            <div className="flex-1">
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <p className="text-sm text-white/80 mb-2">
                  {recommendation.isGood ? 'Kondisi Ideal Untuk:' : 'Rekomendasi:'}
                </p>
                <p className="font-semibold text-lg">{recommendation.type}</p>
                <p className="text-sm text-white/90 mt-1">{recommendation.subtitle}</p>
              </div>

              <div className="space-y-2">
                {recommendation.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <svg 
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        tip.icon === 'check' ? 'text-[#6EC58E]' : 'text-yellow-300'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      {tip.icon === 'check' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      )}
                    </svg>
                    <p className="text-sm text-white/90">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs text-white/80">Waktu terbaik: Pagi (06:00-09:00) atau Sore (15:00-17:00)</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
