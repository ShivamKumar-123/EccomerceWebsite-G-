import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { 
  Search, Package, Truck, CheckCircle, Clock, XCircle, 
  MapPin, Phone, Mail, Calendar, ArrowRight, ShoppingBag,
  PackageCheck, PackageX, Timer, CircleDot, RefreshCw, Download, FileText
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { WaveSeparator } from '../components/WaveSeparator';
import { canCallApi } from '../services/productsApi';
import { listOrdersByUserId, lookupOrder } from '../services/operationsApi';

// Function to generate order report PDF
const generateOrderReport = (order) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const itemsTotal = order.items?.reduce((sum, item) => {
    const price = parseInt(String(item.price || '0').replace(/[₹,]/g, '')) || 0;
    return sum + (price * (item.quantity || 1));
  }, 0) || 0;
  
  const gst = itemsTotal * 0.18;
  const subtotalWithGst = itemsTotal + gst;
  const deliveryFee = order.deliveryFee || 0;
  const grandTotal = subtotalWithGst + deliveryFee;

  const reportContent = `
================================================================================
                              HEAVYTECH INDIA
                         ORDER INVOICE / RECEIPT
================================================================================

Order ID: ${order.id}
Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { 
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
})}
Order Status: ${order.status?.toUpperCase() || 'PENDING'}
Payment Status: ${order.paymentStatus?.toUpperCase() || 'PENDING'}
Delivery: ${order.deliveryLabel || 'Standard'}
Carrier: ${order.carrier || '—'}
Tracking: ${order.trackingNumber || 'Will be updated when shipped'}

--------------------------------------------------------------------------------
                            CUSTOMER DETAILS
--------------------------------------------------------------------------------
Name: ${order.customerInfo?.name || 'N/A'}
Email: ${order.customerInfo?.email || 'N/A'}
Phone: ${order.customerInfo?.phone || 'N/A'}
Address: ${order.customerInfo?.address || 'N/A'}
City: ${order.customerInfo?.city || 'N/A'}
State: ${order.customerInfo?.state || 'N/A'}
Pincode: ${order.customerInfo?.pincode || 'N/A'}

--------------------------------------------------------------------------------
                              ORDER ITEMS
--------------------------------------------------------------------------------
${order.items?.map((item, idx) => {
  const price = parseInt(String(item.price || '0').replace(/[₹,]/g, '')) || 0;
  const qty = item.quantity || 1;
  const total = price * qty;
  const sz = item.selectedSize || item.size;
  return `${idx + 1}. ${item.name}${sz ? ` [Size: ${sz}]` : ''}
   Quantity: ${qty} x ${formatPrice(price)} = ${formatPrice(total)}`;
}).join('\n\n') || 'No items'}

--------------------------------------------------------------------------------
                            PAYMENT SUMMARY
--------------------------------------------------------------------------------
Subtotal:                                          ${formatPrice(itemsTotal)}
GST (18%):                                         ${formatPrice(gst)}
Items + GST:                                       ${formatPrice(subtotalWithGst)}
Delivery fee:                                      ${deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
--------------------------------------------------------------------------------
GRAND TOTAL:                                       ${formatPrice(grandTotal)}
--------------------------------------------------------------------------------

Payment Screenshot: ${order.paymentScreenshot ? 'Uploaded' : 'Not Uploaded'}

================================================================================
                          THANK YOU FOR YOUR ORDER!
================================================================================
HeavyTech India - Quality Agricultural & Food Processing Machinery
Contact: 1800-309-0470 | Email: support@heavytech.in
Website: www.heavytech.in
================================================================================
`;

  // Create and download the file
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HeavyTech_Order_${order.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const TrackOrderPage = () => {
  const pageRef = useRef(null);
  const { refreshOrders } = useCart();
  const { user, isAuthenticated } = useUserAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = async () => {
    if (!canCallApi()) {
      setUserOrders([]);
      return;
    }
    if (isAuthenticated && user) {
      try {
        const list = await listOrdersByUserId(user.id);
        setUserOrders(
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (e) {
        console.error('TrackOrder API:', e);
        setUserOrders([]);
      }
    } else {
      setUserOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders().finally(() => setTimeout(() => setIsRefreshing(false), 400));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-content', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.fromTo('.track-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, [selectedOrder]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = (searchQuery || '').trim();
    if (!q) return;

    const matchLocal = (o) =>
      String(o.id).includes(q) ||
      String(o.id).slice(-8) === q ||
      o.customerInfo?.phone === q;

    let found = userOrders.find(matchLocal);

    if (!found) {
      if (!canCallApi()) {
        alert('Configure VITE_API_URL to track orders from the server.');
        return;
      }
      try {
        found = await lookupOrder(q);
      } catch {
        found = null;
      }
    }

    if (found) {
      setSelectedOrder(found);
    } else {
      alert('Order not found! Please check your Order ID or Phone Number.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <PackageCheck size={20} />;
      case 'rejected': return <PackageX size={20} />;
      case 'shipped': return <Truck size={20} />;
      case 'delivered': return <CheckCircle size={20} />;
      default: return <Timer size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Payment Verification Pending';
      case 'approved': return 'Order Confirmed';
      case 'rejected': return 'Order Rejected';
      case 'shipped': return 'Order Shipped';
      case 'delivered': return 'Order Delivered';
      default: return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTrackingSteps = (status) => {
    const steps = [
      { id: 'placed', label: 'Order Placed', icon: ShoppingBag },
      { id: 'pending', label: 'Payment Verification', icon: Clock },
      { id: 'approved', label: 'Order Confirmed', icon: PackageCheck },
      { id: 'shipped', label: 'Shipped', icon: Truck },
      { id: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const statusOrder = ['placed', 'pending', 'approved', 'shipped', 'delivered'];
    const currentIndex = status === 'rejected' ? 2 : statusOrder.indexOf(status === 'pending' ? 'pending' : status);

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIndex,
      current: idx === currentIndex,
      rejected: status === 'rejected' && idx === 2,
    }));
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
              <Package className="inline mr-2" size={16} />
              Track Your Order
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 px-1">
              Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Tracking</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 px-1">
              Enter your Order ID or Phone Number to track your order
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto w-full px-1">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Order ID or Phone Number"
                    className="w-full min-w-0 pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 shrink-0 w-full sm:w-auto"
                >
                  Track
                </button>
              </div>
            </form>
          </div>
        </div>

        <WaveSeparator color="#ffffff" className="absolute bottom-0 left-0 right-0" />
      </section>

      {/* Order Details Section */}
      <section className="py-10 sm:py-16 bg-white dark:bg-gray-950 min-h-[50vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          {selectedOrder ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Order Header */}
              <div className="track-card bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Order ID</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">#{selectedOrder.id.slice(-8)}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="font-semibold">{getStatusText(selectedOrder.status)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Order Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Items</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.items?.length} Products</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2 md:col-span-1">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-purple-600 dark:text-purple-300 font-bold">₹</span>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Total (incl. delivery)</p>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {formatPrice((selectedOrder.total || 0) * 1.18 + (selectedOrder.deliveryFee || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping & tracking */}
              <div className="track-card bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Truck size={22} className="text-green-600 dark:text-green-400" />
                  Delivery & tracking
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Method</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.deliveryLabel || 'Standard delivery'}</p>
                    {selectedOrder.deliveryDescription && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedOrder.deliveryDescription}</p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      Delivery fee:{' '}
                      {(selectedOrder.deliveryFee || 0) === 0 ? 'Free' : formatPrice(selectedOrder.deliveryFee || 0)}
                      {selectedOrder.deliveryEtaDays ? ` · Est. ${selectedOrder.deliveryEtaDays} day(s)` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Carrier</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.carrier || '—'}</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-3">Tracking number</p>
                    <p className="font-mono font-medium text-gray-900 dark:text-white break-all">
                      {selectedOrder.trackingNumber || 'Available after dispatch'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="track-card bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Order Progress</h3>
                
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  
                  <div className="space-y-8">
                    {getTrackingSteps(selectedOrder.status).map((step, idx) => (
                      <div key={step.id} className="relative flex items-start gap-6">
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                          step.rejected ? 'bg-red-500 text-white' :
                          step.completed ? 'bg-green-500 text-white' : 
                          'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}>
                          {step.rejected ? <XCircle size={24} /> : <step.icon size={24} />}
                        </div>
                        <div className="flex-1 pt-2">
                          <p className={`font-semibold ${
                            step.rejected ? 'text-red-600' :
                            step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {step.rejected ? 'Order Rejected' : step.label}
                          </p>
                          {step.current && !step.rejected && (
                            <p className="text-green-600 text-sm mt-1">Current Status</p>
                          )}
                          {step.rejected && (
                            <p className="text-red-500 text-sm mt-1">Payment verification failed. Please contact support.</p>
                          )}
                        </div>
                        {step.completed && !step.rejected && (
                          <CheckCircle className="text-green-500 mt-2" size={20} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="track-card bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={item.lineId || `${item.id}-${item.selectedSize || item.size || ''}-${idx}`}
                      className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
                    >
                      <img src={item.image} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h4>
                        {(item.selectedSize || item.size) && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Size: <span className="font-medium">{item.selectedSize || item.size}</span>
                          </p>
                        )}
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-green-600 dark:text-green-400 shrink-0">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="track-card bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Delivery Address</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-gray-600 dark:text-gray-300">{selectedOrder.customerInfo?.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.customerInfo?.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedOrder.customerInfo?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="text-gray-400 dark:text-gray-500 mt-1 shrink-0" size={18} />
                      <p className="text-gray-700 dark:text-gray-300">{selectedOrder.customerInfo?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 dark:text-gray-500 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">{selectedOrder.customerInfo?.address}</p>
                      <p className="text-gray-700 dark:text-gray-300">{selectedOrder.customerInfo?.city}, {selectedOrder.customerInfo?.state} - {selectedOrder.customerInfo?.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => generateOrderReport(selectedOrder)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <Download size={20} />
                  Download Invoice
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300"
                >
                  ← Track Another Order
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* My Orders Section */}
              {userOrders.length > 0 ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Your Recent Orders</h2>
                    <button
                      onClick={handleRefresh}
                      className={`flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-200 transition-colors w-full sm:w-auto ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                      <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="track-card bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center shrink-0">
                              <Package className="text-green-600 dark:text-green-400" size={28} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white">Order #{order.id.slice(-8)}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">{order.items?.length} items • {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="font-medium">{getStatusText(order.status)}</span>
                            </div>
                            <p className="font-bold text-green-600 dark:text-green-400">
                              {formatPrice((order.total || 0) * 1.18 + (order.deliveryFee || 0))}
                            </p>
                            <ArrowRight className="text-gray-400 dark:text-gray-500 hidden sm:block" size={20} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="text-gray-400" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You haven't placed any orders yet. Start shopping to place your first order!
                  </p>
                  
                  {/* How to Order Steps */}
                  <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto mb-8 text-left">
                    <h4 className="font-bold text-gray-900 mb-4 text-center">How to Place an Order</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                        <div>
                          <p className="font-semibold text-gray-900">Browse Products</p>
                          <p className="text-gray-600 text-sm">Go to Products page and add items to your cart</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                        <div>
                          <p className="font-semibold text-gray-900">Checkout</p>
                          <p className="text-gray-600 text-sm">Fill your delivery address and contact details</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                        <div>
                          <p className="font-semibold text-gray-900">Pay via UPI</p>
                          <p className="text-gray-600 text-sm">Scan QR code, make payment and upload screenshot</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                        <div>
                          <p className="font-semibold text-gray-900">Track Order</p>
                          <p className="text-gray-600 text-sm">Come back here to track your order status</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all hover:scale-105"
                  >
                    Start Shopping
                    <ArrowRight size={20} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            If you have any questions about your order, feel free to contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:18003090470"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-2 border-green-600 text-green-600 dark:text-green-400 px-6 py-3 rounded-full font-semibold hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Phone size={20} />
              1800-309-0470
            </a>
            <a
              href="mailto:support@heavytechmachinery.com"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-2 border-green-600 text-green-600 dark:text-green-400 px-6 py-3 rounded-full font-semibold hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Mail size={20} />
              Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrackOrderPage;
