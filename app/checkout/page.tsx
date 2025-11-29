'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi, addressApi, checkoutApi, paymentApi } from '@/lib/api';
import { Cart, Address } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [shippingPrice, setShippingPrice] = useState(15000);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cartRes, addressRes] = await Promise.all([
        cartApi.getCart(),
        addressApi.getAll(),
      ]);
      
      setCart(cartRes.data.data.cart);
      setAddresses(addressRes.data.data.addresses || []);
      
      const defaultAddr = addressRes.data.data.addresses?.find((a: Address) => a.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingPrice;
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create checkout
      const checkoutRes = await checkoutApi.create({
        addressId: selectedAddress,
        items: cart?.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity
        })) || [],
        shippingCost: shippingPrice,
      });

      const checkoutId = checkoutRes.data.data.checkout.id;

      // Create payment
      const paymentRes = await paymentApi.create({
        checkoutId: checkoutId,
      });

      const snapToken = paymentRes.data.data.snap_token;

      // Redirect to Midtrans payment page
      if (snapToken) {
        window.open(paymentRes.data.data.redirect_url, '_blank');
        router.push(`/orders`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
        <button
          onClick={() => router.push('/')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            {addresses.length === 0 ? (
              <p className="text-gray-600">No addresses found. Please add one first.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block p-4 border rounded-lg cursor-pointer ${
                      selectedAddress === address.id ? 'border-green-600 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <p className="font-medium">{address.label}</p>
                      <p className="text-sm">{address.recipient_name} - {address.phone}</p>
                      <p className="text-sm text-gray-600">
                        {address.address_line}, {address.city}, {address.province} {address.postal_code}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 border-b">
                  <div className="w-16 h-16 bg-gray-200 rounded">
                    {item.product.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Rp {shippingPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing || addresses.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
            >
              {processing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
