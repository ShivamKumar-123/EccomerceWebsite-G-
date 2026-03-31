import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WaveSeparator } from '../components/WaveSeparator';

const CartPage = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.fromTo('.cart-item', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, [cartItems]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div ref={pageRef} className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] bg-gradient-to-br from-[#0a2e14] via-[#1a5f2a] to-[#0d3d18] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20 w-full min-w-0">
          <div className="hero-content text-center">
            <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <ShoppingCart className="inline mr-2" size={16} />
              Your Shopping Cart
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 px-1">
              Shopping <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Cart</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-300">
              {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        <WaveSeparator color="#ffffff" className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Cart Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full min-w-0">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="mx-auto text-gray-300 mb-6" size={80} />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added any products yet.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all hover:scale-105"
              >
                Browse Products
                <ArrowRight size={20} />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.lineId || item.id}
                    className="cart-item bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      {item.selectedSize ? (
                        <p className="text-sm text-gray-600 mb-1">
                          Size: <span className="font-semibold text-gray-900">{item.selectedSize}</span>
                        </p>
                      ) : null}
                      <p className="text-green-600 font-semibold text-xl">{item.price}</p>
                      {item.badge && (
                        <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium mt-2">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow">
                        <button
                          onClick={() => updateQuantity(item.lineId || item.id, item.quantity - 1)}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.lineId || item.id, item.quantity + 1)}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.lineId || item.id)}
                        className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
                  <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal ({getCartCount()} items)</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span className="text-green-400">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Tax (GST 18%)</span>
                      <span>{formatPrice(getCartTotal() * 0.18)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between text-white text-xl font-bold">
                        <span>Total</span>
                        <span>{formatPrice(getCartTotal() * 1.18)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 py-4 rounded-full font-bold hover:shadow-xl hover:shadow-yellow-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight size={20} />
                  </button>

                  <Link
                    to="/products"
                    className="block text-center text-gray-400 hover:text-white mt-4 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CartPage;
