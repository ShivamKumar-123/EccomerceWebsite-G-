import { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut, 
  CheckCircle, XCircle, Clock, Eye, Trash2, Edit, Plus, Search,
  TrendingUp, DollarSign, ShoppingCart, AlertCircle, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight, Truck, PackageCheck, CreditCard, Image, RefreshCw, Home, X, Download, Warehouse, LayoutTemplate, UserPlus,
  Mail, Phone, MapPin, FileText, ExternalLink, KeyRound, StickyNote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as productsApi from '../services/productsApi';
import * as operationsApi from '../services/operationsApi';
import * as bannersApi from '../services/bannersApi';
import * as siteSectionsApi from '../services/siteSectionsApi';
import * as deliveryPartnersApi from '../services/deliveryPartnerApi';
import ThemeToggle from '../components/ThemeToggle';
import PaginationBar from '../components/PaginationBar';
import LazyImage from '../components/LazyImage';
import {
  getDeliveryOptions,
  saveDeliveryOptions,
  fetchDeliveryOptionsForAdmin,
} from '../assets/data/deliveryStore';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { AGE_GROUP_OPTIONS, GENDER_OPTIONS, PRESET_COLORS } from '../lib/productFilterConstants';

// Analytics Dashboard Component
const AnalyticsDashboard = ({ orders = [], products = [], users = [] }) => {
  // Calculate metrics from real data
  const totalRevenue = orders.filter(o => o.status === 'approved' || o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const approvedOrders = orders.filter(o => o.status === 'approved' || o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const rejectedOrders = orders.filter(o => o.status === 'rejected').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const conversionRate = totalOrders > 0 ? ((approvedOrders / totalOrders) * 100).toFixed(1) : 0;
  const avgOrderValue = approvedOrders > 0 ? (totalRevenue / approvedOrders) : 0;

  // Calculate monthly data from real orders
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, idx) => {
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === idx && orderDate.getFullYear() === currentYear;
      });
      
      const monthRevenue = monthOrders
        .filter(o => o.status === 'approved' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total || 0), 0);
      
      return {
        month,
        sales: monthRevenue,
        orders: monthOrders.length
      };
    });
  };
  
  const monthlyData = getMonthlyData();

  // Calculate category distribution from real orders
  const getCategoryData = () => {
    const categories = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const cat = item.category || 'Others';
        categories[cat] = (categories[cat] || 0) + 1;
      });
    });
    
    const colors = ['#16A34A', '#F59E0B', '#B87444', '#8b5cf6', '#DC2626'];
    return Object.entries(categories).map(([name, value], idx) => ({
      name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      color: colors[idx % colors.length]
    }));
  };
  
  const categoryData = getCategoryData().length > 0 ? getCategoryData() : [
    { name: 'No Data', value: 1, color: '#e5e7eb' }
  ];

  const weeklyTraffic = [
    { day: 'Mon', visitors: 142, pageViews: 380 },
    { day: 'Tue', visitors: 158, pageViews: 412 },
    { day: 'Wed', visitors: 131, pageViews: 355 },
    { day: 'Thu', visitors: 176, pageViews: 468 },
    { day: 'Fri', visitors: 189, pageViews: 502 },
    { day: 'Sat', visitors: 124, pageViews: 340 },
    { day: 'Sun', visitors: 98, pageViews: 276 },
  ];

  // Order status distribution from real data
  const orderStatusData = [
    { name: 'Delivered', value: deliveredOrders, color: '#10b981' },
    { name: 'Approved', value: approvedOrders - deliveredOrders, color: '#22c55e' },
    { name: 'Shipped', value: shippedOrders, color: '#B87444' },
    { name: 'Pending', value: pendingOrders, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedOrders, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Calculate top products from real orders
  const getTopProducts = () => {
    const productStats = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const name = item.name || 'Unknown Product';
        if (!productStats[name]) {
          productStats[name] = { sales: 0, revenue: 0 };
        }
        productStats[name].sales += item.quantity || 1;
        const price = parseInt(String(item.price || '0').replace(/[₹,]/g, '')) || 0;
        productStats[name].revenue += price * (item.quantity || 1);
      });
    });
    
    return Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };
  
  const topProducts = getTopProducts();

  // Recent activity from orders
  const recentActivity = orders
    .slice(0, 7)
    .map(order => ({
      day: new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      orders: 1,
      revenue: order.total || 0
    }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metrics = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(totalRevenue), 
      change: totalRevenue > 0 ? '+' + ((totalRevenue / 100000) * 10).toFixed(1) + '%' : '0%', 
      isPositive: totalRevenue > 0,
      icon: DollarSign,
      color: 'from-primary-500 to-primary-600'
    },
    { 
      label: 'Total Orders', 
      value: totalOrders, 
      change: totalOrders > 0 ? '+' + totalOrders : '0', 
      isPositive: totalOrders > 0,
      icon: ShoppingBag,
      color: 'from-secondary-500 to-secondary-700'
    },
    { 
      label: 'Conversion Rate', 
      value: `${conversionRate}%`, 
      change: conversionRate > 50 ? '+' + (conversionRate - 50).toFixed(1) + '%' : '-' + (50 - conversionRate).toFixed(1) + '%', 
      isPositive: conversionRate > 50,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      label: 'Total Users', 
      value: users.length, 
      change: users.length > 0 ? '+' + users.length : '0', 
      isPositive: users.length > 0,
      icon: Activity,
      color: 'from-orange-500 to-red-600'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select className="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center`}>
                <metric.icon className="text-white" size={24} />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${metric.isPositive ? 'text-primary-600' : 'text-red-600'}`}>
                {metric.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {metric.change}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{metric.label}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="orders" fill="#B87444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPie>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Share']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPie>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Orders']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {orderStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Traffic */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Traffic</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyTraffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="visitors" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              <Line type="monotone" dataKey="pageViews" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">Visitors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Page Views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3">Product</th>
                <th className="pb-3">Sales</th>
                <th className="pb-3">Revenue</th>
                <th className="pb-3">Performance</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-100 rounded-lg flex items-center justify-center">
                        <Package className="text-primary-600" size={20} />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 font-semibold">{product.sales} units</td>
                  <td className="py-4 text-primary-600 font-semibold">{formatCurrency(product.revenue)}</td>
                  <td className="py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-primary-500 h-2 rounded-full" 
                        style={{ width: `${(product.sales / 45) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <p className="text-primary-100 text-sm">Products Listed</p>
          <p className="text-3xl font-bold">{products.length || 12}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-700 p-6 text-white">
          <p className="text-sm text-secondary-100">Active Customers</p>
          <p className="text-3xl font-bold">248</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm">Dealers Network</p>
          <p className="text-3xl font-bold">56</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <p className="text-orange-100 text-sm">States Covered</p>
          <p className="text-3xl font-bold">28+</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, admin, logout, updateAdminCredentials } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminProductsPage, setAdminProductsPage] = useState(1);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    username: '',
    password: '',
    name: '',
  });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersViewed, setUsersViewed] = useState(false);
  const [screenshotModal, setScreenshotModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ads, setAds] = useState([]);
  const [showAdModal, setShowAdModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [siteSections, setSiteSections] = useState([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [backendApiUrl, setBackendApiUrl] = useState('');
  const [backendDrfToken, setBackendDrfToken] = useState('');
  const [backendJwtRefresh, setBackendJwtRefresh] = useState('');
  const [deliveryOpts, setDeliveryOpts] = useState(() => getDeliveryOptions());
  const [deliveryForm, setDeliveryForm] = useState(null);
  const [logisticsDraft, setLogisticsDraft] = useState({
    trackingNumber: '',
    carrier: '',
    deliveryPartnerId: '',
  });
  const [deliveryPartnerUsers, setDeliveryPartnerUsers] = useState([]);
  const [partnerApplications, setPartnerApplications] = useState([]);
  const [partnerAppsLoading, setPartnerAppsLoading] = useState(false);
  const [partnerAppModal, setPartnerAppModal] = useState(null);
  const [partnerApprovePassword, setPartnerApprovePassword] = useState('');
  const [partnerRejectNote, setPartnerRejectNote] = useState('');
  const [partnerActionLoading, setPartnerActionLoading] = useState(false);

  const loadDeliveryOpts = async () => {
    if (productsApi.canCallApi() && productsApi.getDrfToken()) {
      try {
        const list = await fetchDeliveryOptionsForAdmin();
        if (list) {
          setDeliveryOpts(list);
          return;
        }
      } catch (e) {
        console.error('loadDeliveryOpts API:', e);
      }
    }
    setDeliveryOpts(getDeliveryOptions());
  };

  const orderGrandTotal = (order) => (order.total || 0) * 1.18 + (order.deliveryFee || 0);

  const loadAds = async () => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      setAds([]);
      return;
    }
    try {
      const rows = await bannersApi.listBannersAdmin();
      setAds(rows.map((b) => ({ ...b, active: b.active !== false })));
    } catch (e) {
      console.error('Error loading banners:', e);
      setAds([]);
    }
  };

  const loadSiteSections = async () => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      setSiteSections([]);
      return;
    }
    try {
      const rows = await siteSectionsApi.listSiteSectionsAdmin({ placement: 'home' });
      setSiteSections(
        rows.map((s) => ({ ...s, active: s.active !== false })).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      );
    } catch (e) {
      console.error('Error loading site sections:', e);
      setSiteSections([]);
    }
  };

  const loadPartnerApplications = async () => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      setPartnerApplications([]);
      return;
    }
    try {
      setPartnerAppsLoading(true);
      const rows = await deliveryPartnersApi.listDeliveryPartnerApplications();
      setPartnerApplications(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error('Error loading partner applications:', e);
      setPartnerApplications([]);
    } finally {
      setPartnerAppsLoading(false);
    }
  };

  const openPartnerModal = (row) => {
    setPartnerAppModal(row);
    setPartnerApprovePassword('');
    setPartnerRejectNote('');
  };

  const handleApprovePartner = async () => {
    if (!partnerAppModal) return;
    setPartnerActionLoading(true);
    try {
      await deliveryPartnersApi.approveDeliveryPartnerApplication(partnerAppModal.id, {
        password: partnerApprovePassword.trim() || undefined,
      });
      alert('Approved. Login details were sent to the applicant’s email.');
      setPartnerAppModal(null);
      setPartnerApprovePassword('');
      await loadPartnerApplications();
    } catch (e) {
      alert(e?.message || 'Approve failed');
    } finally {
      setPartnerActionLoading(false);
    }
  };

  const handleRejectPartner = async () => {
    if (!partnerAppModal) return;
    if (!confirm('Reject this application?')) return;
    setPartnerActionLoading(true);
    try {
      await deliveryPartnersApi.rejectDeliveryPartnerApplication(partnerAppModal.id, {
        adminNote: partnerRejectNote.trim(),
      });
      alert('Application rejected.');
      setPartnerAppModal(null);
      setPartnerRejectNote('');
      await loadPartnerApplications();
    } catch (e) {
      alert(e?.message || 'Reject failed');
    } finally {
      setPartnerActionLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      setOrders([]);
      return;
    }
    try {
      const allOrders = await operationsApi.listOrdersAdmin();
      setOrders(allOrders);
    } catch (e) {
      console.error('Error loading orders from API:', e);
      setOrders([]);
    }
  };

  const loadDeliveryPartnerUsers = async () => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      setDeliveryPartnerUsers([]);
      return;
    }
    try {
      const rows = await deliveryPartnersApi.listStaffDeliveryPartnerUsers();
      setDeliveryPartnerUsers(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error('Error loading delivery partner users:', e);
      setDeliveryPartnerUsers([]);
    }
  };

  const loadProducts = async () => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      setProducts([]);
      return;
    }
    try {
      const rows = await productsApi.listAllAdminProducts();
      setProducts(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.error('Error loading products from API:', e);
      setProducts([]);
    }
  };

  // Load users from localStorage
  const loadUsers = () => {
    let allUsers = [];
    try {
      const stored = localStorage.getItem('goldymart_users');
      if (stored) {
        allUsers = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading users from localStorage:', e);
    }
    setUsers(allUsers);
  };

  const patchOrder = async (orderId, patch) => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) return;
    try {
      const updated = await operationsApi.patchOrderApi(orderId, patch);
      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(orderId) ? updated : o))
      );
      setSelectedOrder((prev) =>
        prev && String(prev.id) === String(orderId) ? { ...prev, ...updated } : prev
      );
    } catch (e) {
      console.error('Error patching order:', e);
      alert(e?.message || 'Failed to update order');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) return;
    try {
      const updated = await operationsApi.patchOrderApi(orderId, { status });
      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(orderId) ? updated : o))
      );
      setSelectedOrder((prev) =>
        prev && String(prev.id) === String(orderId) ? { ...prev, ...updated } : prev
      );
    } catch (e) {
      console.error('Error updating order status:', e);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) return;
    try {
      await operationsApi.deleteOrderApi(orderId);
      setOrders((prev) => prev.filter((o) => String(o.id) !== String(orderId)));
      setSelectedOrder((prev) =>
        prev && String(prev.id) === String(orderId) ? null : prev
      );
      setShowOrderModal(false);
    } catch (e) {
      console.error('Error deleting order:', e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // Load all data on mount
  useEffect(() => {
    setIsLoading(true);
    loadOrders();
    loadProducts();
    loadUsers();
    loadAds();
    loadSiteSections();
    loadDeliveryPartnerUsers();
    setTimeout(() => setIsLoading(false), 800);
  }, []);
  
  // Mark users as viewed when users tab is opened
  useEffect(() => {
    if (activeTab === 'users') {
      setUsersViewed(true);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'settings') {
      const c = productsApi.getBackendConfig();
      setBackendApiUrl(c.apiUrl || import.meta.env.VITE_API_URL || '');
      setBackendDrfToken(
        c.token || import.meta.env.VITE_JWT_ACCESS || import.meta.env.VITE_DRF_TOKEN || ''
      );
      setBackendJwtRefresh(c.refresh || import.meta.env.VITE_JWT_REFRESH || '');
    }
    if (activeTab === 'delivery') {
      loadDeliveryOpts();
    }
    if (activeTab === 'delivery-partners') {
      loadPartnerApplications();
    }
    if (activeTab === 'sections') {
      loadSiteSections();
    }
  }, [activeTab]);

  useEffect(() => {
    if (showOrderModal && selectedOrder) {
      const pid = selectedOrder.deliveryPartnerId;
      setLogisticsDraft({
        trackingNumber: selectedOrder.trackingNumber || '',
        carrier: selectedOrder.carrier || '',
        deliveryPartnerId: pid != null && pid !== '' ? String(pid) : '',
      });
    }
  }, [showOrderModal, selectedOrder?.id]);

  // Refresh data when tab changes
  useEffect(() => {
    loadOrders();
    loadProducts();
  }, [activeTab]);

  // Auto-refresh orders every 3 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dashboard-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-primary-100 text-primary-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'shipped': return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-200';
      case 'delivered': return 'bg-primary-100 text-primary-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <PackageCheck size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'string') {
      return price;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'from-secondary-500 to-secondary-700' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'from-yellow-500 to-orange-600' },
    { label: 'Approved', value: orders.filter(o => o.status === 'approved').length, icon: CheckCircle, color: 'from-primary-500 to-primary-600' },
    { label: 'Total Revenue', value: formatPrice(orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.total, 0)), icon: DollarSign, color: 'from-purple-500 to-pink-600' },
  ];

  const filteredOrders = orders.filter(order => 
    order.customerInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.includes(searchQuery)
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ADMIN_PRODUCTS_PAGE_SIZE = 12;
  const adminProductsTotalPages = Math.max(1, Math.ceil(filteredProducts.length / ADMIN_PRODUCTS_PAGE_SIZE));
  const adminPaginatedProducts = useMemo(() => {
    const start = (adminProductsPage - 1) * ADMIN_PRODUCTS_PAGE_SIZE;
    return filteredProducts.slice(start, start + ADMIN_PRODUCTS_PAGE_SIZE);
  }, [filteredProducts, adminProductsPage]);

  useEffect(() => {
    setAdminProductsPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (adminProductsPage > adminProductsTotalPages) setAdminProductsPage(adminProductsTotalPages);
  }, [adminProductsPage, adminProductsTotalPages]);

  const handleAddProduct = () => {
    const defaultImg =
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&w=400';
    setEditingProduct({
      id: Date.now(),
      name: '',
      category: 'electronics',
      price: '',
      stock: 0,
      image: defaultImg,
      images: [defaultImg],
      sizeVariants: [],
      ageGroups: [],
      genders: [],
      brand: '',
      colors: [],
      originalPrice: '',
      offerDiscountPercent: 0,
      saleDiscountPercent: 0,
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    const sv = product.sizeVariants || product.size_variants;
    const sizeVariants = Array.isArray(sv)
      ? sv.map((v) => ({
          size: String(v.size ?? ''),
          stock: Math.max(0, Number(v.stock) || 0),
        }))
      : [];
    const ageGroups = product.ageGroups || product.age_groups || [];
    const genders = product.genders || [];
    const colors = product.colors || [];
    const imgs = Array.isArray(product.images) && product.images.length
      ? product.images.map((u) => String(u || '').trim()).filter(Boolean)
      : product.image
        ? [String(product.image).trim()]
        : [''];
    setEditingProduct({
      ...product,
      sizeVariants,
      ageGroups: Array.isArray(ageGroups) ? ageGroups : [],
      genders: Array.isArray(genders) ? genders : [],
      brand: product.brand || '',
      colors: Array.isArray(colors) ? colors : [],
      images: imgs.length ? imgs : [''],
      image: imgs[0] || product.image || '',
      originalPrice:
        product.originalPrice != null && product.originalPrice !== ''
          ? String(product.originalPrice)
          : '',
      offerDiscountPercent:
        Number(product.offerDiscountPercent ?? product.offer_discount_percent ?? 0) || 0,
      saleDiscountPercent:
        Number(product.saleDiscountPercent ?? product.sale_discount_percent ?? 0) || 0,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name?.trim()) {
      alert('Product name is required');
      return;
    }
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      alert('Log in via /admin with your Django superuser so JWT is saved — products are stored only on the server.');
      return;
    }
    try {
      const rawSv = Array.isArray(editingProduct.sizeVariants) ? editingProduct.sizeVariants : [];
      const sizeVariants = rawSv
        .filter((v) => v && String(v.size || '').trim())
        .map((v) => ({
          size: String(v.size).trim(),
          stock: Math.max(0, Number(v.stock) || 0),
        }));
      const imageList = (Array.isArray(editingProduct.images) ? editingProduct.images : [])
        .map((u) => String(u || '').trim())
        .filter(Boolean);
      const payload = {
        name: editingProduct.name.trim(),
        category: editingProduct.category,
        price: String(editingProduct.price ?? ''),
        stock: Number(editingProduct.stock) || 0,
        images: imageList,
        image: imageList[0] || String(editingProduct.image || '').trim() || '',
        badge: editingProduct.badge || '',
        rating: Number(editingProduct.rating) || 4.5,
        is_active: editingProduct.is_active !== false && editingProduct.isActive !== false,
        sizeVariants,
        ageGroups: Array.isArray(editingProduct.ageGroups) ? editingProduct.ageGroups : [],
        genders: Array.isArray(editingProduct.genders) ? editingProduct.genders : [],
        brand: String(editingProduct.brand || '').trim(),
        colors: Array.isArray(editingProduct.colors) ? editingProduct.colors : [],
        originalPrice: String(editingProduct.originalPrice ?? '').trim(),
        offerDiscountPercent: Math.max(
          0,
          Math.min(100, Number(editingProduct.offerDiscountPercent) || 0),
        ),
        saleDiscountPercent: Math.max(
          0,
          Math.min(100, Number(editingProduct.saleDiscountPercent) || 0),
        ),
      };
      const existsInList = products.some((p) => String(p.id) === String(editingProduct.id));
      if (existsInList) {
        await productsApi.updateProduct(editingProduct.id, payload);
      } else {
        await productsApi.createProduct(payload);
      }
      await loadProducts();
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (e) {
      alert(e.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) return;
    try {
      await productsApi.deleteProduct(productId);
      await loadProducts();
    } catch (e) {
      alert(e.message || 'Failed to delete product');
    }
  };

  const handleUpdateSettings = () => {
    const u = (adminSettings.username || '').trim();
    const p = (adminSettings.password || '').trim();
    const n = (adminSettings.name || '').trim();
    if (!u || !p) {
      alert('Username and password are required.');
      return;
    }
    updateAdminCredentials(u, p, n || 'Administrator');
    setShowSettingsModal(false);
    alert('Settings updated successfully!');
  };

  const openCredentialsModal = () => {
    try {
      const raw = localStorage.getItem('goldymart_admin');
      const stored = raw ? JSON.parse(raw) : null;
      setAdminSettings({
        username: stored?.username ?? '',
        password: stored?.password ?? '',
        name: stored?.name ?? '',
      });
      setShowSettingsModal(true);
    } catch {
      setAdminSettings({ username: '', password: '', name: '' });
      setShowSettingsModal(true);
    }
  };

  const handleSaveAd = async (adData) => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      alert('JWT required to save banners.');
      return;
    }
    try {
      const body = {
        title: adData.title,
        description: adData.description || '',
        image: adData.image || '',
        link: adData.link || '/products',
        bgColor: adData.bgColor || 'from-secondary-600 to-secondary-800',
        sortOrder: adData.sortOrder ?? 0,
        active: adData.active !== false,
      };
      if (editingAd) {
        await bannersApi.updateBanner(editingAd.id, body);
      } else {
        await bannersApi.createBanner(body);
      }
      await loadAds();
      setShowAdModal(false);
      setEditingAd(null);
      window.dispatchEvent(new CustomEvent('goldymart-ads-updated'));
    } catch (e) {
      alert(e?.message || 'Failed to save banner');
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) return;
    try {
      await bannersApi.deleteBanner(adId);
      await loadAds();
      window.dispatchEvent(new CustomEvent('goldymart-ads-updated'));
    } catch (e) {
      alert(e?.message || 'Failed to delete');
    }
  };

  const handleToggleAdStatus = async (adId) => {
    const ad = ads.find((a) => a.id === adId);
    if (!ad || !productsApi.getDrfToken()) return;
    try {
      await bannersApi.updateBanner(adId, { isActive: !ad.active });
      await loadAds();
      window.dispatchEvent(new CustomEvent('goldymart-ads-updated'));
    } catch (e) {
      alert(e?.message || 'Failed to update');
    }
  };

  const handleSaveSection = async (sectionData) => {
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) {
      alert('JWT required to save page sections.');
      return;
    }
    try {
      const body = {
        title: sectionData.title,
        body: sectionData.body || '',
        image: sectionData.image || '',
        ctaLabel: sectionData.ctaLabel || '',
        ctaLink: sectionData.ctaLink || '',
        placement: sectionData.placement || 'home',
        sortOrder: Number(sectionData.sortOrder) || 0,
        isActive: sectionData.active !== false,
      };
      if (editingSection) {
        await siteSectionsApi.updateSiteSection(editingSection.id, body);
      } else {
        await siteSectionsApi.createSiteSection(body);
      }
      await loadSiteSections();
      setShowSectionModal(false);
      setEditingSection(null);
      window.dispatchEvent(new CustomEvent('goldymart-sections-updated'));
    } catch (e) {
      alert(e?.message || 'Failed to save section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Delete this page section?')) return;
    if (!productsApi.canCallApi() || !productsApi.getDrfToken()) return;
    try {
      await siteSectionsApi.deleteSiteSection(sectionId);
      await loadSiteSections();
      window.dispatchEvent(new CustomEvent('goldymart-sections-updated'));
    } catch (e) {
      alert(e?.message || 'Failed to delete');
    }
  };

  const handleToggleSectionStatus = async (sectionId) => {
    const s = siteSections.find((x) => x.id === sectionId);
    if (!s || !productsApi.getDrfToken()) return;
    try {
      await siteSectionsApi.updateSiteSection(sectionId, { isActive: !s.active });
      await loadSiteSections();
      window.dispatchEvent(new CustomEvent('goldymart-sections-updated'));
    } catch (e) {
      alert(e?.message || 'Failed to update');
    }
  };

  const bgColorOptions = [
    { value: 'from-secondary-500 to-secondary-700', label: 'Brand' },
    { value: 'from-secondary-600 to-secondary-800', label: 'Copper' },
    { value: 'from-orange-500 to-red-600', label: 'Orange' },
    { value: 'from-purple-600 to-pink-600', label: 'Purple' },
    { value: 'from-yellow-500 to-orange-500', label: 'Yellow' },
    { value: 'from-gray-700 to-gray-900', label: 'Dark' },
  ];

  if (!isAuthenticated) return null;

  const saveDeliveryForm = async () => {
    if (!deliveryForm) return;
    const name = (deliveryForm.name || '').trim();
    if (!name) {
      alert('Name is required');
      return;
    }
    const slug =
      deliveryForm.isNew
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || `opt-${Date.now()}`
        : deliveryForm.id;
    const row = {
      id: slug,
      name,
      description: (deliveryForm.description || '').trim(),
      fee: Math.max(0, Number(deliveryForm.fee) || 0),
      etaDays: Math.max(1, Number(deliveryForm.etaDays) || 1),
      active: Boolean(deliveryForm.active),
    };
    if (deliveryForm.isNew && getDeliveryOptions().some((o) => o.id === slug)) {
      alert('An option with this name already exists.');
      return;
    }
    let next;
    if (deliveryForm.isNew) {
      next = [...getDeliveryOptions(), row];
    } else {
      next = getDeliveryOptions().map((o) => (o.id === deliveryForm.id ? row : o));
    }
    try {
      await saveDeliveryOptions(next);
      await loadDeliveryOpts();
      setDeliveryForm(null);
    } catch (e) {
      alert(e?.message || 'Failed to save delivery options');
    }
  };

  const deleteDeliveryOption = async (id) => {
    if (!confirm('Remove this delivery option?')) return;
    try {
      await saveDeliveryOptions(getDeliveryOptions().filter((o) => o.id !== id));
      await loadDeliveryOpts();
    } catch (e) {
      alert(e?.message || 'Failed to remove delivery option');
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-background text-foreground dark:bg-gray-950 dark:text-gray-100">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between gap-2 border-b border-[#E7E5E4] bg-card px-4 py-3 shadow-sm dark:border-white/10 dark:bg-surface lg:hidden">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black text-[#1C1917] dark:text-white">Goldy Mart</h1>
          <p className="text-xs text-[#78716C] dark:text-gray-400">Admin Dashboard</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle scrolled />
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-[#1C1917] transition-colors hover:bg-[#EADBC8]/60 dark:text-white dark:hover:bg-white/10"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          role="presentation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: flex column — scrollable nav, footer never overlaps */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-[min(100%,17rem)] min-h-0 max-w-[85vw] flex-col border-r border-[#E7E5E4] bg-[#F8F7F5] text-[#1C1917] shadow-lg transition-transform duration-300 dark:border-white/10 dark:bg-[#1C1917] dark:text-[#F8F7F5] sm:w-64 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="shrink-0 border-b border-[#E7E5E4] px-4 py-5 dark:border-white/10 sm:px-5">
          <h1 className="text-xl font-black tracking-tight">Goldy Mart</h1>
          <p className="mt-0.5 text-sm text-[#78716C] dark:text-gray-400">Admin Dashboard</p>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:thin] [scrollbar-color:rgba(184,116,68,0.4)_transparent]">
          <Link
            to="/"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#78716C] transition-colors hover:bg-[#EADBC8]/50 hover:text-[#1C1917] dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white sm:px-5"
            onClick={() => setSidebarOpen(false)}
          >
            <Home size={20} className="shrink-0" />
            <span className="truncate">Go to Website</span>
          </Link>

          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'delivery', label: 'Delivery', icon: Warehouse },
            { id: 'delivery-partners', label: 'Partner requests', icon: UserPlus },
            { id: 'ads', label: 'Advertisements', icon: Image },
            { id: 'sections', label: 'Page sections', icon: LayoutTemplate },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors sm:px-5 ${
                activeTab === item.id
                  ? 'bg-[#B87444] text-white shadow-sm dark:bg-[#B87444]'
                  : 'text-[#78716C] hover:bg-[#EADBC8]/50 hover:text-[#1C1917] dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              <span className="min-w-0 truncate">{item.label}</span>
              {item.id === 'orders' && orders.filter((o) => o.status === 'pending').length > 0 && (
                <span className="ml-auto shrink-0 rounded-full bg-[#DC2626] px-2 py-0.5 text-xs font-bold text-white">
                  {orders.filter((o) => o.status === 'pending').length}
                </span>
              )}
              {item.id === 'delivery-partners' &&
                partnerApplications.filter((a) => a.status === 'pending').length > 0 && (
                  <span className="ml-auto shrink-0 rounded-full bg-amber-600 px-2 py-0.5 text-xs font-bold text-white">
                    {partnerApplications.filter((a) => a.status === 'pending').length}
                  </span>
                )}
              {item.id === 'payments' &&
                orders.filter((o) => o.status === 'pending' && o.paymentScreenshot).length > 0 && (
                  <span className="ml-auto shrink-0 rounded-full bg-[#F59E0B] px-2 py-0.5 text-xs font-bold text-white">
                    {orders.filter((o) => o.status === 'pending' && o.paymentScreenshot).length}
                  </span>
                )}
              {item.id === 'users' && !usersViewed && users.length > 0 && (
                <span className="ml-auto shrink-0 rounded-full bg-[#925C36] px-2 py-0.5 text-xs font-bold text-white">
                  {users.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-[#E7E5E4] bg-card p-4 dark:border-white/10 dark:bg-[#23160c]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#78716C] dark:text-gray-500">Theme</span>
            <ThemeToggle scrolled />
          </div>
          <div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F8F7F5] p-2 dark:bg-white/5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B87444] text-sm font-bold text-white">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#1C1917] dark:text-white">{admin?.name || 'Admin'}</p>
              <p className="truncate text-xs text-[#78716C] dark:text-gray-400">{admin?.username}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DC2626]/25 bg-[#DC2626]/10 py-2.5 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626]/15 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main: width must shrink beside sidebar — w-full + ml-64 overflows viewport */}
      <main className="w-full min-w-0 max-w-full px-3 pb-6 pt-20 sm:px-4 sm:pb-8 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-6 lg:pt-8 xl:px-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            <p className="mb-6 rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-gray-700 dark:border-secondary-800 dark:bg-secondary-950/40 dark:text-gray-300">
              <span className="font-semibold text-secondary-700 dark:text-secondary-400">Goldy Mart + Django:</span>{' '}
              Products, hero banners, orders and delivery options are stored in the database. Ensure{' '}
              <code className="text-xs bg-white/60 dark:bg-black/30 px-1 rounded">VITE_API_URL</code> is set and you
              logged in here with your <strong>superuser</strong> (JWT) so changes save to the server.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="dashboard-card bg-white rounded-2xl p-6 shadow-lg">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm border-b">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="py-4 font-mono text-sm">#{order.id.slice(-8)}</td>
                          <td className="py-4">{order.customerInfo?.name}</td>
                          <td className="py-4 font-semibold">{formatPrice(orderGrandTotal(order))}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-500 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard orders={orders} products={products} users={users} />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
              {filteredOrders.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">No orders found</p>
              ) : (
                <div className="overflow-x-auto -mx-px">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 dark:bg-gray-900/80">
                    <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                      <th className="px-4 sm:px-6 py-4">Order ID</th>
                      <th className="px-4 sm:px-6 py-4">Customer</th>
                      <th className="px-4 sm:px-6 py-4">Delivery</th>
                      <th className="px-4 sm:px-6 py-4">Items</th>
                      <th className="px-4 sm:px-6 py-4">Total</th>
                      <th className="px-4 sm:px-6 py-4">Status</th>
                      <th className="px-4 sm:px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/40 dark:border-gray-700">
                        <td className="px-4 sm:px-6 py-4 font-mono text-sm">#{order.id.slice(-8)}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{order.customerInfo?.name}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{order.customerInfo?.phone}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-[140px] truncate" title={order.deliveryLabel}>
                          {order.deliveryLabel || '—'}
                        </td>
                        <td className="px-4 sm:px-6 py-4">{order.items?.length} items</td>
                        <td className="px-4 sm:px-6 py-4 font-semibold whitespace-nowrap">{formatPrice(orderGrandTotal(order))}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            <button
                              onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                              className="rounded-lg p-2 text-secondary-600 transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-900/30"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'approved')}
                                  className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            {order.status === 'approved' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                className="rounded-lg p-2 text-secondary-600 transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-900/30"
                                title="Mark as Shipped"
                              >
                                <Truck size={18} />
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                title="Mark as Delivered"
                              >
                                <PackageCheck size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Payment Verification</h2>
              <button
                onClick={loadOrders}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>

            {/* Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Pending Verification</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'pending').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Verified Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'approved' || o.status === 'shipped' || o.status === 'delivered').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="text-red-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'rejected').length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Payment Verifications</h3>
              {orders.filter(o => o.status === 'pending').length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending payments to verify</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.filter(o => o.status === 'pending').map((order) => (
                    <div key={order.id} className="border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Payment Screenshot */}
                      <div className="relative h-48 bg-gray-100">
                        {order.paymentScreenshot ? (
                          <img 
                            src={order.paymentScreenshot} 
                            alt="Payment Screenshot" 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(order.paymentScreenshot, '_blank')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <Image size={48} className="mx-auto mb-2" />
                              <p>No screenshot</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Pending
                        </div>
                      </div>
                      
                      {/* Order Info */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-gray-900">Order #{order.id.slice(-8)}</p>
                            <p className="text-gray-500 text-sm">{order.customerInfo?.name}</p>
                          </div>
                          <p className="font-bold text-primary-600">{formatPrice(orderGrandTotal(order))}</p>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">
                          {order.items?.length} items • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          📞 {order.customerInfo?.phone}
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'approved')}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                          >
                            <CheckCircle size={16} />
                            Verify
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Payments History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">All Payments History</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No payments yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm border-b">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Screenshot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="py-4 font-mono text-sm">#{order.id.slice(-8)}</td>
                          <td className="py-4">
                            <p className="font-medium">{order.customerInfo?.name}</p>
                            <p className="text-gray-500 text-sm">{order.customerInfo?.phone}</p>
                          </td>
                          <td className="py-4 font-semibold">{formatPrice(orderGrandTotal(order))}</td>
                          <td className="py-4 text-gray-500 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4">
                            {order.paymentScreenshot ? (
                              <button
                                onClick={() => setScreenshotModal(order.paymentScreenshot)}
                                className="flex items-center gap-1 text-secondary-600 hover:text-secondary-700"
                              >
                                <Eye size={16} />
                                View
                              </button>
                            ) : (
                              <span className="text-gray-400">No image</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="min-w-0 max-w-full">
            <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <h2 className="shrink-0 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Products Management</h2>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <div className="relative min-w-0 flex-1 sm:min-w-[12rem] sm:max-w-xs sm:flex-initial">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 font-medium text-white transition-all hover:shadow-lg"
                >
                  <Plus size={20} />
                  Add Product
                </button>
              </div>
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {adminPaginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="dashboard-card flex min-w-0 max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-900"
                >
                  <div className="aspect-[4/3] w-full min-h-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <LazyImage
                      src={product.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <h3 className="mb-2 line-clamp-2 break-words text-base font-bold text-gray-900 dark:text-white">{product.name}</h3>
                    <div className="mb-1 flex flex-wrap items-baseline gap-2">
                      <p className="text-lg font-semibold text-primary-600">{product.price}</p>
                      {product.originalPrice ? (
                        <p className="text-sm text-gray-400 line-through dark:text-gray-500">{product.originalPrice}</p>
                      ) : null}
                    </div>
                    {(product.offerDiscountPercent > 0 || product.saleDiscountPercent > 0) && (
                      <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                        {product.offerDiscountPercent > 0 && (
                          <span className="mr-2">Offer {product.offerDiscountPercent}%</span>
                        )}
                        {product.saleDiscountPercent > 0 && (
                          <span>Sale {product.saleDiscountPercent}%</span>
                        )}
                      </p>
                    )}
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Stock: {product.stock} units</p>
                    <div className="mt-auto flex min-w-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="inline-flex min-h-[2.5rem] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary-100 px-3 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-200 dark:bg-secondary-900/40 dark:text-secondary-300"
                      >
                        <Edit size={16} className="shrink-0" />
                        <span className="truncate">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="inline-flex min-h-[2.5rem] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400"
                      >
                        <Trash2 size={16} className="shrink-0" />
                        <span className="truncate">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <PaginationBar
              className="mt-8"
              currentPage={adminProductsPage}
              totalPages={adminProductsTotalPages}
              totalCount={filteredProducts.length}
              pageSize={ADMIN_PRODUCTS_PAGE_SIZE}
              onPageChange={setAdminProductsPage}
            />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={loadUsers}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100">
                    <Users className="text-secondary-700" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Users with Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => orders.some(o => o.userId === u.id)).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">New This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => {
                        const created = new Date(u.createdAt);
                        const now = new Date();
                        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">All Registered Users</h3>
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No users registered yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm border-b">
                        <th className="pb-3">User</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Orders</th>
                        <th className="pb-3">Total Spent</th>
                        <th className="pb-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const userOrders = orders.filter(o => o.userId === user.id);
                        const totalSpent = userOrders
                          .filter(o => ['approved', 'shipped', 'delivered'].includes(o.status))
                          .reduce((sum, o) => sum + (o.total * 1.18), 0);
                        
                        return (
                          <tr key={user.id} className="border-b last:border-0">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-gray-500 text-xs">ID: {user.id.slice(-8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-gray-600">{user.email}</td>
                            <td className="py-4 text-gray-600">{user.phone || '-'}</td>
                            <td className="py-4">
                              <span className="rounded-full bg-secondary-100 px-2 py-1 text-sm font-medium text-secondary-700">
                                {userOrders.length} orders
                              </span>
                            </td>
                            <td className="py-4 font-semibold text-primary-600">
                              {formatPrice(totalSpent)}
                            </td>
                            <td className="py-4 text-gray-500 text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advertisements Tab */}
        {activeTab === 'ads' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Advertisement Management</h2>
              <button
                onClick={() => {
                  setEditingAd(null);
                  setShowAdModal(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                Add New Ad
              </button>
            </div>

            {/* Ads Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Image className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Ads</p>
                    <p className="text-2xl font-bold text-gray-900">{ads.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100">
                    <CheckCircle className="text-secondary-700" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Active Ads</p>
                    <p className="text-2xl font-bold text-gray-900">{ads.filter(a => a.active).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <XCircle className="text-gray-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Inactive Ads</p>
                    <p className="text-2xl font-bold text-gray-900">{ads.filter(a => !a.active).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ads List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">All Advertisements</h3>
              {ads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No advertisements yet. Click "Add New Ad" to create one.</p>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.id} className={`border rounded-xl p-4 ${ad.active ? 'border-primary-200 bg-primary-50/50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Ad Preview */}
                        <div className={`w-full sm:w-48 h-24 bg-gradient-to-r ${ad.bgColor} rounded-lg flex items-center justify-center text-white text-sm font-medium`}>
                          {ad.image ? (
                            <img src={ad.image} alt={ad.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            'No Image'
                          )}
                        </div>
                        
                        {/* Ad Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900">{ad.title}</h4>
                              <p className="text-gray-500 text-sm mt-1">{ad.description}</p>
                              <p className="text-gray-400 text-xs mt-2">Link: {ad.link}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ad.active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                              {ad.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleToggleAdStatus(ad.id)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${ad.active ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
                            >
                              {ad.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingAd(ad);
                                setShowAdModal(true);
                              }}
                              className="rounded-lg bg-secondary-100 px-3 py-1 text-sm font-medium text-secondary-800 hover:bg-secondary-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page sections (home content blocks) */}
        {activeTab === 'sections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Page sections</h2>
              <button
                type="button"
                onClick={() => {
                  setEditingSection(null);
                  setShowSectionModal(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                Add section
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Content blocks shown on the home page below trending products. Use sort order (lower first); only active sections are visible to visitors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center">
                    <LayoutTemplate className="text-violet-600 dark:text-violet-300" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{siteSections.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-primary-600 dark:text-primary-300" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Active</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{siteSections.filter((s) => s.active).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <XCircle className="text-gray-600 dark:text-gray-300" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Inactive</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{siteSections.filter((s) => !s.active).length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Home page sections</h3>
              {siteSections.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No sections yet. Add one to show custom copy on the storefront.</p>
              ) : (
                <div className="space-y-4">
                  {siteSections.map((sec) => (
                    <div
                      key={sec.id}
                      className={`border rounded-xl p-4 ${sec.active ? 'border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-950/20' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50'}`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                          {sec.image ? (
                            <img src={sec.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 dark:text-white">{sec.title}</h4>
                              {sec.body ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2 whitespace-pre-line">{sec.body}</p>
                              ) : null}
                              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                                Sort: {sec.sortOrder ?? 0} · Placement: {sec.placement}
                                {sec.ctaLabel && sec.ctaLink ? ` · CTA: ${sec.ctaLabel} → ${sec.ctaLink}` : ''}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${sec.active ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                            >
                              {sec.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => handleToggleSectionStatus(sec.id)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${sec.active ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100 hover:bg-gray-300' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 hover:bg-primary-200'}`}
                            >
                              {sec.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSection(sec);
                                setShowSectionModal(true);
                              }}
                              className="rounded-lg bg-secondary-100 px-3 py-1 text-sm font-medium text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-900/40 dark:text-secondary-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 rounded-lg text-sm font-medium hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery options (checkout + customer-facing) */}
        {activeTab === 'delivery' && (
          <div className="max-w-4xl mx-auto w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Delivery options</h2>
              <button
                type="button"
                onClick={() =>
                  setDeliveryForm({
                    isNew: true,
                    id: `new-${Date.now()}`,
                    name: '',
                    description: '',
                    fee: 0,
                    etaDays: 7,
                    active: true,
                  })
                }
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700 w-full sm:w-auto"
              >
                <Plus size={18} />
                Add option
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              These appear on checkout; fees are added to the order total. Inactive options are hidden from customers.
            </p>
            <div className="space-y-3">
              {deliveryOpts.map((opt) => (
                <div
                  key={opt.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white">{opt.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{opt.description}</p>
                    <p className="text-sm mt-1 text-primary-600 dark:text-primary-400">
                      Fee: {opt.fee === 0 ? 'Free' : formatPrice(opt.fee)} · ETA: ~{opt.etaDays} day
                      {opt.etaDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${opt.active ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {opt.active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDeliveryForm({
                          isNew: false,
                          id: opt.id,
                          name: opt.name,
                          description: opt.description,
                          fee: opt.fee,
                          etaDays: opt.etaDays,
                          active: opt.active,
                        })
                      }
                      className="rounded-lg bg-secondary-100 px-3 py-1.5 text-sm font-medium text-secondary-900 dark:bg-secondary-900/40 dark:text-secondary-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDeliveryOption(opt.id)}
                      className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {deliveryForm && (
              <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {deliveryForm.isNew ? 'New delivery option' : 'Edit delivery option'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input
                        value={deliveryForm.name}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={deliveryForm.description}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={deliveryForm.fee}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, fee: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ETA (days)</label>
                        <input
                          type="number"
                          min={1}
                          value={deliveryForm.etaDays}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, etaDays: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={deliveryForm.active}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, active: e.target.checked })}
                      />
                      Show on checkout
                    </label>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setDeliveryForm(null)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveDeliveryForm}
                      className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'delivery-partners' && (
          <div className="w-full min-w-0 max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Delivery partner requests</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Review applications, then approve to create a user account and email the password, or reject with an internal note.
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadPartnerApplications()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {!productsApi.canCallApi() || !productsApi.getDrfToken() ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">Connect JWT in Settings to load partner requests.</p>
            ) : partnerAppsLoading ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>
            ) : partnerApplications.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No applications yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-900">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Name</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Email</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Phone</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Location</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Submitted</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerApplications.map((a) => (
                      <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{a.fullName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.email}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{a.phone}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {a.city}, {a.district}, {a.state}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              a.status === 'pending'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
                                : a.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200'
                                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openPartnerModal(a)}
                            className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {partnerAppModal && (
              <div
                className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/60 p-3 backdrop-blur-sm sm:p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="partner-app-modal-title"
              >
                <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-2xl shadow-stone-900/20 dark:border-white/10 dark:bg-stone-900 dark:shadow-black/40">
                  {/* Header */}
                  <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#8B5A2B] via-primary-800 to-stone-900 px-5 py-5 text-white sm:px-6 sm:py-6">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-48 rounded-full bg-secondary-500/20 blur-3xl" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Partner application</p>
                        <h3 id="partner-app-modal-title" className="mt-1 font-display text-xl font-black tracking-tight sm:text-2xl">
                          {partnerAppModal.fullName}
                        </h3>
                        <p className="mt-1 text-sm text-white/80">
                          ID #{partnerAppModal.id}
                          <span className="mx-2 text-white/40">·</span>
                          Age {partnerAppModal.age}
                        </p>
                        <span
                          className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                            partnerAppModal.status === 'pending'
                              ? 'bg-amber-400/95 text-amber-950'
                              : partnerAppModal.status === 'approved'
                                ? 'bg-emerald-400/95 text-emerald-950'
                                : 'bg-white/20 text-white'
                          }`}
                        >
                          {partnerAppModal.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPartnerAppModal(null)}
                        className="shrink-0 rounded-xl bg-white/10 p-2.5 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-6 p-5 sm:p-6">
                      {/* Applicant details — grid */}
                      <section>
                        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                          <UserPlus className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          Contact & IDs
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            {
                              icon: Mail,
                              label: 'Email',
                              value: partnerAppModal.email,
                              className: 'sm:col-span-2',
                            },
                            {
                              icon: Phone,
                              label: 'Phone',
                              value: partnerAppModal.phone,
                            },
                            {
                              icon: FileText,
                              label: 'Driving licence',
                              value: partnerAppModal.licenseNumber,
                            },
                            {
                              icon: FileText,
                              label: 'Aadhaar',
                              value: partnerAppModal.aadharNumber,
                            },
                            {
                              icon: FileText,
                              label: 'PAN',
                              value: partnerAppModal.panNumber,
                            },
                            {
                              icon: MapPin,
                              label: 'Location',
                              value: [partnerAppModal.city, partnerAppModal.district, partnerAppModal.state]
                                .filter(Boolean)
                                .join(', '),
                              className: 'sm:col-span-2',
                            },
                          ].map((row) => (
                            <div
                              key={row.label}
                              className={`rounded-2xl border border-stone-100 bg-stone-50/80 p-4 dark:border-white/5 dark:bg-stone-800/50 ${row.className || ''}`}
                            >
                              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                                <row.icon className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                                {row.label}
                              </div>
                              <p className="mt-1.5 break-words text-sm font-semibold text-stone-900 dark:text-stone-100">
                                {row.value || '—'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Document previews */}
                      <section>
                        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                          <Image className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          Document uploads
                        </h4>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {[
                            ['licenseImageFrontUrl', 'Licence · front'],
                            ['licenseImageBackUrl', 'Licence · back'],
                            ['aadharImageFrontUrl', 'Aadhaar · front'],
                            ['aadharImageBackUrl', 'Aadhaar · back'],
                            ['panImageFrontUrl', 'PAN · front'],
                            ['panImageBackUrl', 'PAN · back'],
                          ].map(([key, label]) =>
                            partnerAppModal[key] ? (
                              <a
                                key={key}
                                href={partnerAppModal[key]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-100 shadow-sm ring-stone-900/5 transition-all hover:border-primary-400/60 hover:shadow-md dark:border-white/10 dark:bg-stone-800 dark:ring-white/5 dark:hover:border-primary-500/50"
                              >
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200 dark:bg-stone-900">
                                  <img
                                    src={partnerAppModal[key]}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-stone-900/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-stone-900 shadow-lg">
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      Open full size
                                    </span>
                                  </div>
                                </div>
                                <p className="border-t border-stone-200/80 px-3 py-2.5 text-center text-[11px] font-bold text-stone-700 dark:border-white/10 dark:text-stone-200">
                                  {label}
                                </p>
                              </a>
                            ) : (
                              <div
                                key={key}
                                className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 text-[11px] text-stone-400 dark:border-white/10 dark:bg-stone-800/30 dark:text-stone-500"
                              >
                                {label}
                                <span className="mt-1 text-[10px]">No file</span>
                              </div>
                            )
                          )}
                        </div>
                      </section>

                      {partnerAppModal.status === 'pending' ? (
                        <section className="rounded-2xl border border-stone-200/90 bg-gradient-to-b from-stone-50/90 to-white p-4 dark:border-white/10 dark:from-stone-800/40 dark:to-stone-900/80 sm:p-5">
                          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                            Review actions
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                                <KeyRound className="h-3.5 w-3.5 text-primary-600" />
                                Password (optional)
                              </label>
                              <p className="mb-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
                                Min 8 characters if you set one. Leave empty to auto-generate and email the partner.
                              </p>
                              <input
                                type="text"
                                autoComplete="new-password"
                                value={partnerApprovePassword}
                                onChange={(e) => setPartnerApprovePassword(e.target.value)}
                                placeholder="Auto-generate if empty"
                                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-inner outline-none transition-all placeholder:text-stone-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 dark:border-white/10 dark:bg-stone-950 dark:text-white dark:placeholder:text-stone-500 dark:focus:border-primary-400"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                                <StickyNote className="h-3.5 w-3.5 text-stone-500" />
                                Internal reject note
                              </label>
                              <textarea
                                rows={3}
                                value={partnerRejectNote}
                                onChange={(e) => setPartnerRejectNote(e.target.value)}
                                placeholder="Visible only to admins when rejecting…"
                                className="w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-inner outline-none transition-all placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-400/20 dark:border-white/10 dark:bg-stone-950 dark:text-white dark:focus:border-stone-500"
                              />
                            </div>
                          </div>
                        </section>
                      ) : (
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-white/10 dark:bg-stone-800/50 dark:text-stone-300">
                          <span className="font-semibold text-stone-800 dark:text-stone-200">Final status:</span>{' '}
                          {partnerAppModal.status}
                          {partnerAppModal.linkedUserId ? (
                            <span className="mt-1 block text-xs text-stone-500">
                              Linked user id: {partnerAppModal.linkedUserId}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="shrink-0 border-t border-stone-200/90 bg-stone-50/95 p-4 dark:border-white/10 dark:bg-stone-950/95 sm:px-6">
                    {partnerAppModal.status === 'pending' ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => setPartnerAppModal(null)}
                          className="order-3 rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:border-white/10 dark:text-stone-200 dark:hover:bg-white/5 sm:order-1 sm:w-auto"
                        >
                          Cancel
                        </button>
                        <div className="flex flex-col gap-2 sm:order-2 sm:flex-row sm:gap-3">
                          <button
                            type="button"
                            disabled={partnerActionLoading}
                            onClick={handleRejectPartner}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition-all hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:bg-stone-900 dark:text-red-300 dark:hover:bg-red-950/40"
                          >
                            <XCircle className="h-4 w-4 shrink-0" />
                            Reject application
                          </button>
                          <button
                            type="button"
                            disabled={partnerActionLoading}
                            onClick={handleApprovePartner}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition-all hover:brightness-105 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            {partnerActionLoading ? 'Working…' : 'Approve & email password'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPartnerAppModal(null)}
                        className="w-full rounded-xl bg-stone-900 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl w-full min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Admin Credentials</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Update your admin login credentials</p>
              
              <button
                type="button"
                onClick={openCredentialsModal}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <Settings size={20} />
                Update Credentials
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-8 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Backend API (JWT)</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Obtain tokens with{' '}
                <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded text-gray-800 dark:text-gray-200">POST /api/auth/token/</code>{' '}
                (JSON body: <code className="text-xs">username</code>, <code className="text-xs">password</code>) or run{' '}
                <code className="text-xs">python manage.py init_admin</code>.
                Use the access token as Bearer; refresh token renews access when it expires (optional but recommended).
              </p>
              {import.meta.env.VITE_API_URL && (
                <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-3">
                  API URL comes from <code className="font-mono text-xs">VITE_API_URL</code> in .env (not browser storage).
                </p>
              )}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API base URL</label>
              <input
                type="url"
                value={backendApiUrl}
                onChange={(e) => setBackendApiUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                disabled={Boolean(import.meta.env.VITE_API_URL)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4 disabled:opacity-60"
              />
              {(import.meta.env.VITE_JWT_ACCESS || import.meta.env.VITE_DRF_TOKEN) && (
                <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-3">
                  Access token is set via <code className="font-mono text-xs">VITE_JWT_ACCESS</code> (or legacy{' '}
                  <code className="font-mono text-xs">VITE_DRF_TOKEN</code>).
                </p>
              )}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">JWT access token</label>
              <input
                type="password"
                value={backendDrfToken}
                onChange={(e) => setBackendDrfToken(e.target.value)}
                placeholder="Paste access token from init_admin or POST /api/auth/token/"
                disabled={Boolean(import.meta.env.VITE_JWT_ACCESS || import.meta.env.VITE_DRF_TOKEN)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4 disabled:opacity-60"
              />
              {import.meta.env.VITE_JWT_REFRESH && (
                <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-3">
                  Refresh token comes from <code className="font-mono text-xs">VITE_JWT_REFRESH</code> in .env.
                </p>
              )}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                JWT refresh token <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="password"
                value={backendJwtRefresh}
                onChange={(e) => setBackendJwtRefresh(e.target.value)}
                placeholder="Paste refresh token for automatic renewal"
                disabled={Boolean(import.meta.env.VITE_JWT_REFRESH)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => {
                  productsApi.setBackendConfig(backendApiUrl, backendDrfToken, backendJwtRefresh);
                  loadProducts();
                  loadOrders();
                  loadDeliveryOpts();
                  alert('Backend settings saved.');
                }}
                className="bg-gray-900 dark:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-primary-700 transition-all w-full sm:w-auto"
              >
                Save backend settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Order #{selectedOrder.id.slice(-8)}</h3>
                <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white shrink-0">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Customer Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customerInfo?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customerInfo?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customerInfo?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">City</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customerInfo?.city}, {selectedOrder.customerInfo?.state}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customerInfo?.address}, {selectedOrder.customerInfo?.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Delivery (from checkout) */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Truck size={18} />
                  Delivery
                </h4>
                <div className="rounded-xl bg-secondary-50 p-4 text-sm text-gray-800 dark:bg-secondary-950/40 dark:text-gray-200">
                  <p className="font-semibold">{selectedOrder.deliveryLabel || 'Standard'}</p>
                  {selectedOrder.deliveryDescription && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedOrder.deliveryDescription}</p>
                  )}
                  <p className="mt-2">
                    Fee:{' '}
                    {(selectedOrder.deliveryFee || 0) === 0
                      ? 'Free'
                      : formatPrice(selectedOrder.deliveryFee || 0)}{' '}
                    · ETA: ~{selectedOrder.deliveryEtaDays || 7} days
                  </p>
                </div>
              </div>

              {/* Tracking (admin-managed) */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Tracking, carrier & partner</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Carrier</label>
                    <input
                      value={logisticsDraft.carrier}
                      onChange={(e) => setLogisticsDraft((d) => ({ ...d, carrier: e.target.value }))}
                      placeholder="e.g. BlueDart, Delhivery"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tracking number</label>
                    <input
                      value={logisticsDraft.trackingNumber}
                      onChange={(e) => setLogisticsDraft((d) => ({ ...d, trackingNumber: e.target.value }))}
                      placeholder="AWB / tracking ID"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Assigned delivery partner
                    </label>
                    <select
                      value={logisticsDraft.deliveryPartnerId}
                      onChange={(e) =>
                        setLogisticsDraft((d) => ({ ...d, deliveryPartnerId: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">Unassigned</option>
                      {deliveryPartnerUsers.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.fullName} — {p.email}
                        </option>
                      ))}
                    </select>
                    {deliveryPartnerUsers.length === 0 && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        No approved partners in the system yet. Approve an application under Delivery partners first.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const raw = logisticsDraft.deliveryPartnerId.trim();
                    patchOrder(selectedOrder.id, {
                      carrier: logisticsDraft.carrier.trim(),
                      trackingNumber: logisticsDraft.trackingNumber.trim(),
                      deliveryPartnerId: raw === '' ? null : Number(raw),
                    });
                    alert('Logistics and partner assignment saved.');
                  }}
                  className="mt-3 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-primary-600 text-white text-sm font-medium hover:opacity-90"
                >
                  Save logistics & partner
                </button>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={item.lineId || `${item.id}-${item.selectedSize || item.size || ''}-${idx}`}
                      className="flex items-center gap-3 sm:gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4"
                    >
                      <img src={item.image} alt={item.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                        {(item.selectedSize || item.size) && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Size: <span className="font-semibold">{item.selectedSize || item.size}</span>
                          </p>
                        )}
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white shrink-0">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Screenshot */}
              {selectedOrder.paymentScreenshot && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Payment Screenshot</h4>
                  <img 
                    src={selectedOrder.paymentScreenshot} 
                    alt="Payment Screenshot" 
                    className="max-h-64 rounded-xl border border-gray-200 dark:border-gray-600 w-full object-contain"
                  />
                </div>
              )}

              {Array.isArray(selectedOrder.deliveryProofImages) &&
                selectedOrder.deliveryProofImages.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-bold text-gray-900 dark:text-white">
                      Delivery proof (partner)
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {selectedOrder.deliveryProofImages.map((src, i) => (
                        <a
                          key={`${src}-${i}`}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <img
                            src={src}
                            alt={`Delivery proof ${i + 1}`}
                            className="h-28 w-full object-cover sm:h-32"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Totals */}
              <div className="bg-primary-50 dark:bg-primary-950/30 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Items + GST (18%)</span>
                  <span className="font-medium">{formatPrice((selectedOrder.total || 0) * 1.18)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Delivery</span>
                  <span className="font-medium">
                    {(selectedOrder.deliveryFee || 0) === 0 ? 'Free' : formatPrice(selectedOrder.deliveryFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-primary-200 dark:border-primary-800">
                  <span className="font-bold text-gray-900 dark:text-white">Total paid</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(orderGrandTotal(selectedOrder))}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedOrder.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => { handleUpdateOrderStatus(selectedOrder.id, 'approved'); setShowOrderModal(false); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    <CheckCircle size={20} />
                    Approve Order
                  </button>
                  <button
                    onClick={() => { handleUpdateOrderStatus(selectedOrder.id, 'rejected'); setShowOrderModal(false); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    <XCircle size={20} />
                    Reject Order
                  </button>
                </div>
              )}
              {selectedOrder.status === 'approved' && (
                <button
                  onClick={() => { handleUpdateOrderStatus(selectedOrder.id, 'shipped'); setShowOrderModal(false); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-600 py-3 font-medium text-white transition-colors hover:bg-secondary-700"
                >
                  <Truck size={20} />
                  Mark as Shipped
                </button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={() => { handleUpdateOrderStatus(selectedOrder.id, 'delivered'); setShowOrderModal(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  <PackageCheck size={20} />
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingProduct.name ? 'Edit Product' : 'Add Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="clothes">Clothing &amp; Apparel</option>
                  <option value="home-kitchen">Home &amp; Kitchen</option>
                  <option value="beauty">Beauty &amp; Care</option>
                  <option value="sports">Sports &amp; Fitness</option>
                  <option value="books">Books</option>
                  <option value="sneakers">Sneakers</option>
                  <option value="sports-shoes">Sports Shoes</option>
                  <option value="casual-shoes">Casual Shoes</option>
                  <option value="formal-shoes">Formal Shoes</option>
                  <option value="boots">Boots</option>
                  <option value="sandals">Sandals</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original (MRP)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.originalPrice ?? ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, originalPrice: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Optional, e.g. ₹5,999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sale / final price
                  </label>
                  <input
                    type="text"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="₹00,000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full max-w-xs px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                If you add size rows below, total stock on the server is usually derived from those rows.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Badge</label>
                  <input
                    type="text"
                    value={editingProduct.badge ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g. Sale, New"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={5}
                    value={editingProduct.rating ?? 4.5}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Offer discount % (0–100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingProduct.offerDiscountPercent ?? 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        offerDiscountPercent: Math.max(
                          0,
                          Math.min(100, parseInt(e.target.value, 10) || 0),
                        ),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sale discount % (0–100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingProduct.saleDiscountPercent ?? 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        saleDiscountPercent: Math.max(
                          0,
                          Math.min(100, parseInt(e.target.value, 10) || 0),
                        ),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Offer and sale % can differ per product. /shoes discount filters match if either % meets the
                threshold. MRP vs sale price is set above.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product images (URLs)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [...(editingProduct.images || []), ''],
                      })
                    }
                    className="shrink-0 rounded-lg border border-primary-500/40 bg-primary-500/10 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-500/20 dark:text-primary-300"
                  >
                    + Add image
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  First image is used on product cards; all show on the product detail page.
                </p>
                {(editingProduct.images && editingProduct.images.length
                  ? editingProduct.images
                  : [editingProduct.image || '']
                ).map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const next = [
                          ...(editingProduct.images && editingProduct.images.length
                            ? editingProduct.images
                            : [editingProduct.image || '']),
                        ];
                        next[idx] = e.target.value;
                        const first = next.map((s) => String(s || '').trim()).find(Boolean) || '';
                        setEditingProduct({ ...editingProduct, images: next, image: first });
                      }}
                      placeholder="https://…"
                      className="min-w-0 flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const base =
                          editingProduct.images && editingProduct.images.length
                            ? [...editingProduct.images]
                            : [editingProduct.image || ''];
                        base.splice(idx, 1);
                        const next = base.length ? base : [''];
                        const first = next.map((s) => String(s || '').trim()).find(Boolean) || '';
                        setEditingProduct({ ...editingProduct, images: next, image: first });
                      }}
                      className="shrink-0 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Storefront filters (age, gender, brand, color)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Used on the products page sidebar. Leave age/gender empty so the item matches any selection on that axis.
                </p>
                <div>
                  <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Age groups</span>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUP_OPTIONS.map((o) => (
                      <label key={o.id} className="inline-flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={(editingProduct.ageGroups || []).includes(o.id)}
                          onChange={(e) => {
                            const cur = editingProduct.ageGroups || [];
                            const next = e.target.checked
                              ? [...new Set([...cur, o.id])]
                              : cur.filter((x) => x !== o.id);
                            setEditingProduct({ ...editingProduct, ageGroups: next });
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Gender</span>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map((o) => (
                      <label key={o.id} className="inline-flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={(editingProduct.genders || []).includes(o.id)}
                          onChange={(e) => {
                            const cur = editingProduct.genders || [];
                            const next = e.target.checked
                              ? [...new Set([...cur, o.id])]
                              : cur.filter((x) => x !== o.id);
                            setEditingProduct({ ...editingProduct, genders: next });
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="e.g. Nike"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Colors</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((o) => (
                      <label key={o.id} className="inline-flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={(editingProduct.colors || []).includes(o.id)}
                          onChange={(e) => {
                            const cur = editingProduct.colors || [];
                            const next = e.target.checked
                              ? [...new Set([...cur, o.id])]
                              : cur.filter((x) => x !== o.id);
                            setEditingProduct({ ...editingProduct, colors: next });
                          }}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Size variants (clothing / footwear)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct({
                          ...editingProduct,
                          sizeVariants: [
                            { size: 'S', stock: 10 },
                            { size: 'M', stock: 20 },
                            { size: 'L', stock: 18 },
                            { size: 'XL', stock: 14 },
                            { size: 'XXL', stock: 8 },
                          ],
                        })
                      }
                      className="text-xs px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 font-medium"
                    >
                      Preset S–XXL
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct({
                          ...editingProduct,
                          sizeVariants: [
                            ...(editingProduct.sizeVariants || []),
                            { size: '', stock: 0 },
                          ],
                        })
                      }
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200 font-medium inline-flex items-center gap-1"
                    >
                      <Plus size={14} /> Add row
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for products without sizes. Customers must pick a size before add to cart.
                </p>
                {(editingProduct.sizeVariants || []).map((row, idx) => (
                  <div key={idx} className="flex flex-wrap gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Size (e.g. M, UK 9)"
                      value={row.size}
                      onChange={(e) => {
                        const next = [...(editingProduct.sizeVariants || [])];
                        next[idx] = { ...next[idx], size: e.target.value };
                        setEditingProduct({ ...editingProduct, sizeVariants: next });
                      }}
                      className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Stock"
                      value={row.stock}
                      onChange={(e) => {
                        const next = [...(editingProduct.sizeVariants || [])];
                        next[idx] = { ...next[idx], stock: parseInt(e.target.value, 10) || 0 };
                        setEditingProduct({ ...editingProduct, sizeVariants: next });
                      }}
                      className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (editingProduct.sizeVariants || []).filter((_, i) => i !== idx);
                        setEditingProduct({ ...editingProduct, sizeVariants: next });
                      }}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Remove size row"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveProduct}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal — z above sidebar (z-50) */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          onClick={(e) => e.target === e.currentTarget && setShowSettingsModal(false)}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center gap-2">
                <h3 id="settings-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Admin Credentials
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white shrink-0"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={adminSettings.name}
                  onChange={(e) => setAdminSettings({ ...adminSettings, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  autoComplete="username"
                  value={adminSettings.username}
                  onChange={(e) => setAdminSettings({ ...adminSettings, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={adminSettings.password}
                  onChange={(e) => setAdminSettings({ ...adminSettings, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <button
                type="button"
                onClick={handleUpdateSettings}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Save credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page section modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingSection ? 'Edit section' : 'Add page section'}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionModal(false);
                    setEditingSection(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            <form
              key={editingSection?.id ?? 'new-section'}
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                await handleSaveSection({
                  title: formData.get('title'),
                  body: formData.get('body'),
                  image: formData.get('image'),
                  ctaLabel: formData.get('ctaLabel'),
                  ctaLink: formData.get('ctaLink'),
                  placement: formData.get('placement'),
                  sortOrder: formData.get('sortOrder'),
                  active: formData.get('sectionActive') === 'on',
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingSection?.title || ''}
                  required
                  placeholder="Section headline"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Body</label>
                <textarea
                  name="body"
                  defaultValue={editingSection?.body || ''}
                  rows={4}
                  placeholder="Paragraph text (line breaks kept)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  defaultValue={editingSection?.image || ''}
                  placeholder="https://…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CTA label</label>
                  <input
                    type="text"
                    name="ctaLabel"
                    defaultValue={editingSection?.ctaLabel || ''}
                    placeholder="e.g. Shop now"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CTA link</label>
                  <input
                    type="text"
                    name="ctaLink"
                    defaultValue={editingSection?.ctaLink || ''}
                    placeholder="/products or https://…"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Placement</label>
                  <select
                    name="placement"
                    defaultValue={editingSection?.placement || 'home'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="home">Home page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort order</label>
                  <input
                    type="number"
                    name="sortOrder"
                    min={0}
                    defaultValue={editingSection?.sortOrder ?? 0}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="sectionActive"
                  id="sectionActive"
                  defaultChecked={editingSection?.active ?? true}
                  className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="sectionActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active (visible on site)
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                {editingSection ? 'Update section' : 'Create section'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}</h3>
                <button onClick={() => { setShowAdModal(false); setEditingAd(null); }} className="text-gray-500 hover:text-gray-700">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              await handleSaveAd({
                title: formData.get('title'),
                description: formData.get('description'),
                image: formData.get('image'),
                link: formData.get('link'),
                bgColor: formData.get('bgColor'),
                active: formData.get('active') === 'on'
              });
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingAd?.title || ''}
                  required
                  placeholder="e.g., Mega Sale - 30% Off!"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  defaultValue={editingAd?.description || ''}
                  required
                  rows={2}
                  placeholder="Short description of the offer"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  name="image"
                  defaultValue={editingAd?.image || ''}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link (where to redirect)</label>
                <input
                  type="text"
                  name="link"
                  defaultValue={editingAd?.link || '/products'}
                  placeholder="/products or /contact"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <select
                  name="bgColor"
                  defaultValue={editingAd?.bgColor || 'from-secondary-500 to-secondary-700'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {bgColorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="active"
                  id="adActive"
                  defaultChecked={editingAd?.active ?? true}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="adActive" className="text-sm font-medium text-gray-700">Active (show on website)</label>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                {editingAd ? 'Update Advertisement' : 'Create Advertisement'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setScreenshotModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img 
              src={screenshotModal} 
              alt="Payment Screenshot" 
              className="w-full h-full object-contain rounded-lg"
            />
            <a
              href={screenshotModal}
              download="payment-screenshot.png"
              className="absolute bottom-4 right-4 flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download size={18} />
              Download
            </a>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-gray-950/90">
          <div className="text-center">
            <div className="relative mx-auto mb-4 h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-500/30" />
              <div
                className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-fuchsia-500 border-r-violet-500"
                style={{ animationDuration: '0.85s' }}
              />
              <div
                className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-amber-400 border-l-violet-400"
                style={{ animationDirection: 'reverse', animationDuration: '1.1s' }}
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading dashboard</h3>
            <p className="text-gray-500 dark:text-gray-400">Please wait…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
