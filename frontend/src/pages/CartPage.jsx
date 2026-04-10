import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WaveSeparator } from '../components/WaveSeparator';
import { labelForColor, swatchStyleForColor } from '../lib/productFilterConstants';

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
      {/* Hero */}
      <section className="relative flex min-h-[38vh] items-center overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-primary-900 to-[#312e81]">
        <div className="absolute inset-0">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-amber-400/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary-400/25 blur-[100px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl min-w-0 px-3 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="hero-content text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/95 backdrop-blur-md sm:mb-6 sm:text-sm">
              <ShoppingCart className="inline" size={16} />
              Your cart
            </span>
            <h1 className="font-display px-1 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              Ready to{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-white bg-clip-text text-transparent">checkout</span>
            </h1>
            <p className="mt-3 text-base text-white/75 sm:text-lg">
              {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} · Secure payment at next step
            </p>
          </div>
        </div>

        <WaveSeparator color="#faf8fc" className="absolute bottom-0 left-0 right-0 dark:hidden" />
        <WaveSeparator color="#0a0e1f" className="absolute bottom-0 left-0 right-0 hidden dark:block" />
      </section>

      <section className="bg-transparent py-12 sm:py-16 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full min-w-0">
          {cartItems.length === 0 ? (
            <div className="rounded-3xl border border-stone-200/80 bg-white/80 py-20 text-center shadow-modern backdrop-blur-sm dark:border-white/10 dark:bg-stone-900/50">
              <ShoppingBag className="mx-auto mb-6 text-primary-200 dark:text-primary-900/40" size={72} />
              <h2 className="font-display mb-3 text-2xl font-bold text-stone-900 dark:text-white">Your cart is empty</h2>
              <p className="mb-8 text-stone-600 dark:text-stone-400">Add something you love — deals update daily.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-700 px-8 py-4 font-bold text-white shadow-lg shadow-primary-900/25 transition-all hover:scale-[1.02] hover:brightness-105"
              >
                Browse products
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
                    className="cart-item flex flex-col items-center gap-6 rounded-3xl border border-stone-200/80 bg-white/90 p-5 shadow-soft backdrop-blur-sm dark:border-white/10 dark:bg-stone-900/60 sm:flex-row sm:p-6"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-32 w-32 rounded-2xl object-cover ring-2 ring-stone-100 dark:ring-white/5"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-white">{item.name}</h3>
                      {item.selectedSize ? (
                        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                          Size: <span className="font-semibold text-stone-900 dark:text-white">{item.selectedSize}</span>
                        </p>
                      ) : null}
                      {item.selectedColor ? (
                        <p className="mt-1 flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                          <span
                            className="inline-block h-5 w-5 shrink-0 rounded-full border border-stone-300 dark:border-stone-500"
                            style={swatchStyleForColor(item.selectedColor)}
                          />
                          <span>
                            Color:{' '}
                            <span className="font-semibold text-stone-900 dark:text-white">
                              {labelForColor(item.selectedColor)}
                            </span>
                          </span>
                        </p>
                      ) : null}
                      <p className="mt-1 text-xl font-bold text-primary-600 dark:text-primary-400">{item.price}</p>
                      {item.badge && (
                        <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 p-1 dark:border-white/10 dark:bg-stone-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.lineId || item.id, item.quantity - 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-100 dark:bg-stone-700 dark:text-white dark:hover:bg-stone-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-stone-900 dark:text-white">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.lineId || item.id, item.quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-100 dark:bg-stone-700 dark:text-white dark:hover:bg-stone-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.lineId || item.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e1b4b] via-primary-900 to-[#312e81] p-6 shadow-modern ring-1 ring-white/10 sm:p-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />
                  <h3 className="font-display relative mb-6 text-xl font-bold text-white">Order summary</h3>

                  <div className="relative mb-6 space-y-4 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Subtotal ({getCartCount()} items)</span>
                      <span className="font-semibold text-white">{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Shipping</span>
                      <span className="font-bold text-amber-300">Free</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Tax (GST 18%)</span>
                      <span className="font-semibold text-white">{formatPrice(getCartTotal() * 0.18)}</span>
                    </div>
                    <div className="border-t border-white/15 pt-4">
                      <div className="flex justify-between text-xl font-black text-white">
                        <span>Total</span>
                        <span>{formatPrice(getCartTotal() * 1.18)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/checkout')}
                    className="relative flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary-500 via-amber-400 to-secondary-600 py-4 font-extrabold text-stone-900 shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02] hover:brightness-105"
                  >
                    Proceed to checkout
                    <ArrowRight size={20} />
                  </button>

                  <Link
                    to="/products"
                    className="relative mt-4 block text-center text-sm font-medium text-white/60 transition-colors hover:text-white"
                  >
                    Continue shopping
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
