import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Package, LogOut, Edit, Save, X, 
  ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronRight
} from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { OrderStore } from '../assets/data/dataStore';
import { WaveSeparator } from '../components/WaveSeparator';
import { canCallApi } from '../services/productsApi';
import { listOrdersByUserId } from '../services/operationsApi';

const ProfilePage = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, refreshOrders } = useUserAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
      loadOrders();
    }
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.profile-card', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [activeTab]);

  const loadOrders = async () => {
    if (!user) return;
    if (canCallApi()) {
      try {
        const list = await listOrdersByUserId(user.id);
        setOrders(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch {
        setOrders([]);
      }
      return;
    }
    const userOrders = OrderStore.getByUserId(user.id);
    setOrders(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const result = updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-primary-600 bg-primary-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'shipped': return 'text-secondary-800 bg-secondary-100 dark:bg-secondary-900/40 dark:text-secondary-200';
      case 'delivered': return 'text-primary-600 bg-primary-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <Package size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (!user) return null;

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 pt-24 sm:pt-32 pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl mx-auto sm:mx-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">{user.name}</h1>
              <p className="text-gray-400 text-sm sm:text-base truncate sm:whitespace-normal sm:break-all">{user.email}</p>
            </div>
          </div>
        </div>
        <WaveSeparator />
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 lg:sticky lg:top-24">
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'My Profile', icon: User },
                    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="profile-card bg-white rounded-2xl shadow-lg p-4 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-600 rounded-xl hover:bg-primary-200 transition-colors"
                      >
                        <Edit size={18} />
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                        >
                          <Save size={18} />
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-500 text-sm mb-1">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-500 text-sm mb-1">Email</label>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>

                    <div>
                      <label className="block text-gray-500 text-sm mb-1">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-500 text-sm mb-1">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user.city || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-500 text-sm mb-1">Address</label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user.address || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-500 text-sm mb-1">State</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user.state || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-500 text-sm mb-1">Pincode</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{user.pincode || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <p className="text-gray-500 text-sm">
                      Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="profile-card min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h2>
                    <button
                      onClick={loadOrders}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Refresh
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="text-gray-400" size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                      <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                      >
                        Start Shopping <ChevronRight size={20} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 min-w-0 overflow-hidden">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4">
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 break-all">Order #{order.id.slice(-8)}</p>
                              <p className="text-gray-500 text-sm">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <span className="font-bold text-primary-600 text-lg">
                                {formatPrice(order.total * 1.18)}
                              </span>
                            </div>
                          </div>

                          {order.status === 'delivered' &&
                            Array.isArray(order.deliveryProofImages) &&
                            order.deliveryProofImages.length > 0 && (
                              <div className="border-t pt-4">
                                <p className="text-sm font-semibold text-gray-900 mb-2">
                                  Delivery confirmation photos
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {order.deliveryProofImages.map((src, i) => (
                                    <a
                                      key={`${src}-${i}`}
                                      href={src}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block h-20 w-20 overflow-hidden rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                      <img
                                        src={src}
                                        alt={`Delivery proof ${i + 1}`}
                                        className="h-full w-full object-cover"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div className="border-t pt-4">
                            <div className="flex flex-wrap gap-4">
                              {order.items?.slice(0, 3).map((item, idx) => (
                                <div
                                  key={item.lineId || `${item.id}-${item.selectedSize || item.size || ''}-${idx}`}
                                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                                >
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</p>
                                    {(item.selectedSize || item.size) && (
                                      <p className="text-gray-600 text-xs">Size: {item.selectedSize || item.size}</p>
                                    )}
                                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                              {order.items?.length > 3 && (
                                <div className="flex items-center justify-center bg-gray-100 rounded-xl px-4">
                                  <span className="text-gray-600 text-sm">+{order.items.length - 3} more</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <p className="text-gray-500 text-sm">
                              {order.items?.length} item(s)
                            </p>
                            <Link
                              to="/track-order"
                              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                            >
                              Track Order <ChevronRight size={16} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
