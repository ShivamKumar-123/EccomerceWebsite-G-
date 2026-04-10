import { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, User, Upload, CheckCircle, QrCode, Package, Copy, Check, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { WaveSeparator } from '../components/WaveSeparator';
import {
  getActiveDeliveryOptions,
  getDeliveryOptionById,
  prefetchDeliveryOptions,
} from '../assets/data/deliveryStore';
import { canCallApi } from '../services/productsApi';
import { createOrderApi } from '../services/operationsApi';
import { normalizeCartArray } from '../lib/cartLine';
import {
  cartItemsSkipDeliveryOptions,
  FREIGHT_ON_REQUEST_DELIVERY,
} from '../lib/deliveryPolicy';

function cartStorageHasItems() {
  try {
    const raw =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('goldymart_cart')
        : localStorage.getItem('goldymart_cart');
    return raw ? JSON.parse(raw).length > 0 : false;
  } catch {
    return false;
  }
}

const CheckoutPage = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, refreshOrders: refreshCartOrders } = useCart();
  const { user, isAuthenticated, refreshOrders: refreshUserOrders } = useUserAuth();
  const [step, setStep] = useState(1);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [copied, setCopied] = useState(false);
  /** Snapshot after place order (cart clears before step 3) */
  const [placedSummary, setPlacedSummary] = useState(null);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
  });
  const [deliveryOptions, setDeliveryOptions] = useState(() => getActiveDeliveryOptions());
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(() => {
    const opts = getActiveDeliveryOptions();
    return opts[0]?.id || 'standard';
  });

  useEffect(() => {
    prefetchDeliveryOptions().then(() => {
      const opts = getActiveDeliveryOptions();
      setDeliveryOptions(opts);
      if (!opts.find((o) => o.id === selectedDeliveryId) && opts[0]) {
        setSelectedDeliveryId(opts[0].id);
      }
    });
  }, []);

  useEffect(() => {
    const onUpd = () => {
      const opts = getActiveDeliveryOptions();
      setDeliveryOptions(opts);
      if (!opts.find((o) => o.id === selectedDeliveryId) && opts[0]) {
        setSelectedDeliveryId(opts[0].id);
      }
    };
    window.addEventListener('goldymart-delivery-updated', onUpd);
    return () => window.removeEventListener('goldymart-delivery-updated', onUpd);
  }, [selectedDeliveryId]);

  const skipDeliveryChoice = useMemo(
    () => cartItemsSkipDeliveryOptions(cartItems),
    [cartItems]
  );

  const selectedDelivery = useMemo(() => {
    if (skipDeliveryChoice) return FREIGHT_ON_REQUEST_DELIVERY;
    return (
      getDeliveryOptionById(selectedDeliveryId) ||
      deliveryOptions[0] || { name: 'Standard', fee: 0, description: '', etaDays: 7, id: 'standard' }
    );
  }, [skipDeliveryChoice, selectedDeliveryId, deliveryOptions]);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        district: user.district || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (cartItems.length === 0 && !cartStorageHasItems() && !orderPlaced) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderPlaced]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.fromTo('.checkout-form', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3 });
    }, pageRef);

    return () => ctx.revert();
  }, [step]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      if (!canCallApi()) {
        alert('Backend is not configured. Set VITE_API_URL and run Django (see .env.development).');
        return;
      }

      let cartItemsToUse = [];
      const store = typeof sessionStorage !== 'undefined' ? sessionStorage : localStorage;
      const savedCart = store.getItem('goldymart_cart');
      if (savedCart) {
        cartItemsToUse = normalizeCartArray(JSON.parse(savedCart));
      }
      if (cartItemsToUse.length === 0 && cartItems.length > 0) {
        cartItemsToUse = cartItems;
      }

      if (cartItemsToUse.length === 0) {
        alert('Cart is empty! Please add items first.');
        return;
      }

      let orderTotal = 0;
      cartItemsToUse.forEach((item) => {
        const priceStr = String(item.price || '0');
        const price = parseInt(priceStr.replace(/[₹,]/g, ''), 10) || 0;
        const qty = item.quantity || 1;
        orderTotal += price * qty;
      });

      let currentUserId = null;
      const currentUserStr = localStorage.getItem('goldymart_current_user');
      if (currentUserStr) {
        currentUserId = JSON.parse(currentUserStr).id;
      }

      const skipDel = cartItemsSkipDeliveryOptions(cartItemsToUse);
      const del = skipDel ? FREIGHT_ON_REQUEST_DELIVERY : getDeliveryOptionById(selectedDeliveryId);
      const deliveryFee = del?.fee ?? 0;

      const itemsGst = orderTotal * 1.18;
      const placedPayload = {
        itemCount: cartItemsToUse.length,
        itemsGst,
        deliveryFee,
        deliveryLabel: del?.name || 'Standard',
        grandTotal: itemsGst + deliveryFee,
      };

      const created = await createOrderApi({
        userId: currentUserId,
        total: orderTotal,
        customerInfo: { ...customerInfo },
        items: JSON.parse(JSON.stringify(cartItemsToUse)),
        paymentScreenshot: paymentScreenshot || '',
        status: 'pending',
        paymentStatus: paymentScreenshot ? 'pending' : 'not_uploaded',
        deliveryFee,
        deliveryOptionId: del?.id || selectedDeliveryId,
        deliveryLabel: del?.name || 'Standard',
        deliveryDescription: del?.description || '',
        deliveryEtaDays: del?.etaDays ?? (skipDel ? 0 : 7),
        trackingNumber: '',
        carrier: '',
      });
      clearCart();
      setPlacedSummary(placedPayload);
      setOrderId(created.id);
      setOrderPlaced(true);
      setStep(3);
      await refreshCartOrders();
      refreshUserOrders();
      localStorage.setItem(
        'goldymart_user_info',
        JSON.stringify({
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        })
      );
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order: ' + error.message);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isStep1Valid = () => {
    return customerInfo.name && customerInfo.email && customerInfo.phone && 
           customerInfo.address && customerInfo.city && customerInfo.state && customerInfo.pincode;
  };

  // UPI Payment Details
  const upiId = "goldymart@upi";
  const deliveryFee = selectedDelivery?.fee ?? 0;
  const totalAmount = getCartTotal() * 1.18 + deliveryFee;

  return (
    <div ref={pageRef} className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[30vh] bg-gradient-to-br from-[#0a2e14] via-[#1a5f2a] to-[#0d3d18] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16 w-full min-w-0">
          <div className="hero-content text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 px-1">
              {orderPlaced ? 'Order Placed!' : 'Checkout'}
            </h1>
            <p className="text-base sm:text-xl text-gray-300">
              {orderPlaced ? 'Thank you for your order' : 'Complete your purchase'}
            </p>
          </div>
        </div>

        <WaveSeparator color="#ffffff" className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Progress Steps */}
      {!orderPlaced && (
        <div className="bg-white dark:bg-gray-900 py-6 sm:py-8 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  <span className={`ml-2 text-sm sm:text-base font-medium ${step >= s ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {s === 1 ? 'Details' : 'Payment'}
                  </span>
                  {s < 2 && <div className={`hidden sm:block w-12 sm:w-20 h-1 mx-2 sm:mx-4 ${step > s ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Content */}
      <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-950 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 w-full min-w-0">
          {/* Step 1: Customer Details */}
          {step === 1 && (
            <div className="checkout-form bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="text-primary-600 dark:text-primary-400 shrink-0" />
                Customer Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={customerInfo.pincode}
                    onChange={handleInputChange}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter pincode"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address *</label>
                  <textarea
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    District <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={customerInfo.district}
                    onChange={handleInputChange}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g. Indore — helps assign local delivery partner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={customerInfo.state}
                    onChange={handleInputChange}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Truck className="text-primary-600 dark:text-primary-400" size={22} />
                  Delivery option
                </h3>
                {skipDeliveryChoice ? (
                  <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800/60 p-4 sm:p-5">
                    <p className="font-bold text-amber-900 dark:text-amber-100">{FREIGHT_ON_REQUEST_DELIVERY.name}</p>
                    <p className="text-sm text-amber-800 dark:text-amber-200/90 mt-2 leading-relaxed">
                      {FREIGHT_ON_REQUEST_DELIVERY.description}
                    </p>
                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-400 mt-3">
                      Delivery fee on order: <strong>₹0</strong> (quoted separately after confirmation)
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Choose how you want to receive your order. Fees are set by the store admin.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {deliveryOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedDeliveryId(opt.id)}
                          className={`text-left rounded-2xl border-2 p-4 transition-all ${
                            selectedDeliveryId === opt.id
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500 ring-2 ring-primary-500/30'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                        >
                          <p className="font-bold text-gray-900 dark:text-white">{opt.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{opt.description}</p>
                          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-2">
                            {opt.fee === 0 ? 'Free' : formatPrice(opt.fee)}
                            <span className="text-gray-500 dark:text-gray-400 font-normal">
                              {' '}
                              · ~{opt.etaDays} day{opt.etaDays !== 1 ? 's' : ''}
                            </span>
                          </p>
                        </button>
                      ))}
                    </div>
                    {deliveryOptions.length === 0 && (
                      <p className="text-amber-600 dark:text-amber-400 text-sm">No delivery options available. Contact support.</p>
                    )}
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid() || (!skipDeliveryChoice && deliveryOptions.length === 0)}
                  className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${
                    isStep1Valid() && (skipDeliveryChoice || deliveryOptions.length > 0)
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-xl hover:scale-105'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Payment
                  <CreditCard size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="checkout-form bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <QrCode className="text-primary-600 dark:text-primary-400" />
                Payment via UPI
              </h2>

              <div className="mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-4 text-sm">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Delivery: {selectedDelivery?.name}</p>
                <p className="text-gray-600 dark:text-gray-400">{selectedDelivery?.description}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-gray-700 dark:text-gray-300">
                  <span>Items + GST: <strong>{formatPrice(getCartTotal() * 1.18)}</strong></span>
                  <span>Delivery: <strong>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</strong></span>
                  <span className="text-primary-600 dark:text-primary-400 font-bold">Total: {formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* QR Code Section */}
                <div className="text-center w-full min-w-0">
                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 inline-block max-w-full">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}%26pn=Goldy%20Mart%26am=${totalAmount.toFixed(0)}%26cu=INR`}
                      alt="Payment QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">Scan QR code to pay</p>
                  <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">UPI ID</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white break-all">{upiId}</p>
                  </div>
                  <div className="mt-4 bg-primary-100 dark:bg-primary-900/40 rounded-xl p-4">
                    <p className="text-sm text-primary-600 dark:text-primary-400">Amount to Pay</p>
                    <p className="font-black text-2xl text-primary-700 dark:text-primary-300">{formatPrice(totalAmount)}</p>
                  </div>
                </div>

                {/* Upload Screenshot Section */}
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Upload Payment Screenshot</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    After making the payment, please upload a screenshot of the successful transaction.
                    Our admin will verify and approve your order.
                  </p>

                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 sm:p-6 text-center hover:border-primary-500 dark:hover:border-primary-600 transition-colors">
                    {paymentScreenshot ? (
                      <div>
                        <img
                          src={paymentScreenshot}
                          alt="Payment Screenshot"
                          className="max-h-48 mx-auto rounded-lg mb-4"
                        />
                        <p className="text-primary-600 font-medium">Screenshot uploaded!</p>
                        <button
                          onClick={() => setPaymentScreenshot(null)}
                          className="text-red-500 text-sm mt-2 hover:underline"
                        >
                          Remove and upload another
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 mb-2">Click to upload screenshot</p>
                        <p className="text-gray-400 text-sm">PNG, JPG up to 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <strong>Note:</strong> Your order will be processed after admin verification of payment.
                      You will receive a confirmation once approved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={!paymentScreenshot}
                  className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentScreenshot
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:shadow-xl hover:scale-105'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Place Order
                  <CheckCircle size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Confirmation */}
          {step === 3 && orderPlaced && (
            <div className="checkout-form bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl text-center border border-gray-100 dark:border-gray-800">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-primary-600 dark:text-primary-400" size={48} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Placed Successfully!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">Your order ID is:</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <p className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 break-all">#{orderId?.slice(-8)}</p>
                <button
                  onClick={copyOrderId}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
                  title="Copy Order ID"
                >
                  {copied ? <Check size={20} className="text-primary-600" /> : <Copy size={20} className="text-gray-400" />}
                </button>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 sm:p-6 mb-6 max-w-md mx-auto">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">
                  <strong>Payment Verification Pending</strong><br />
                  Our admin will verify your payment and approve the order.
                  You can track your order status anytime.
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 max-w-md mx-auto text-left border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Items</span>
                    <span className="font-medium text-gray-900 dark:text-white">{placedSummary?.itemCount ?? cartItems.length} products</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600 dark:text-gray-400 shrink-0">Delivery</span>
                    <span className="font-medium text-right text-gray-900 dark:text-white">{placedSummary?.deliveryLabel || selectedDelivery?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Address</span>
                    <span className="font-medium text-right text-gray-900 dark:text-white">{customerInfo.city}, {customerInfo.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Status</span>
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">Verification Pending</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Items + GST</span>
                    <span>{formatPrice(placedSummary?.itemsGst ?? getCartTotal() * 1.18)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Delivery fee</span>
                    <span>
                      {(placedSummary?.deliveryFee ?? deliveryFee) === 0
                        ? 'Free'
                        : formatPrice(placedSummary?.deliveryFee ?? deliveryFee)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(placedSummary?.grandTotal ?? totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/track-order"
                  className="px-8 py-4 rounded-full font-bold bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Package size={20} />
                  Track Your Order
                </Link>
                <button
                  onClick={() => navigate('/products')}
                  className="px-8 py-4 rounded-full font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;
