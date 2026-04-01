// Data Store - Centralized data management for HeavyTech
// All data is stored in localStorage with proper structure

const STORAGE_KEYS = {
  USERS: 'heavytech_users',
  ORDERS: 'heavytech_orders',
  CART: 'heavytech_cart',
  CURRENT_USER: 'heavytech_current_user',
  ADMIN: 'heavytech_admin',
  PRODUCTS: 'heavytech_products',
};

// Helper function to safely get data from localStorage
const getData = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
  }
  return defaultValue;
};

// Helper function to safely save data to localStorage
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
    return false;
  }
};

// ==================== USER MANAGEMENT ====================

export const UserStore = {
  // Get all users
  getAll: () => getData(STORAGE_KEYS.USERS, []),

  // Get user by ID
  getById: (userId) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    return users.find(u => u.id === userId) || null;
  },

  // Get user by email
  getByEmail: (email) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // Get user by phone
  getByPhone: (phone) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    return users.find(u => u.phone === phone) || null;
  },

  // Create new user (signup)
  create: (userData) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    
    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Check if phone already exists
    if (userData.phone && users.find(u => u.phone === userData.phone)) {
      return { success: false, error: 'Phone number already registered' };
    }

    const newUser = {
      id: 'USER_' + Date.now(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone || '',
      password: userData.password, // In production, this should be hashed
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      pincode: userData.pincode || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveData(STORAGE_KEYS.USERS, users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  },

  // Update user
  update: (userId, updates) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      return { success: false, error: 'User not found' };
    }

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveData(STORAGE_KEYS.USERS, users);
    
    const { password, ...userWithoutPassword } = users[index];
    return { success: true, user: userWithoutPassword };
  },

  // Login user
  login: (email, password) => {
    const users = getData(STORAGE_KEYS.USERS, []);
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const { password: pwd, ...userWithoutPassword } = user;
    saveData(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  },

  // Logout user
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return { success: true };
  },

  // Get current logged in user
  getCurrentUser: () => {
    return getData(STORAGE_KEYS.CURRENT_USER, null);
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return getData(STORAGE_KEYS.CURRENT_USER, null) !== null;
  },
};

// ==================== ORDER MANAGEMENT ====================

export const OrderStore = {
  // Get all orders
  getAll: () => getData(STORAGE_KEYS.ORDERS, []),

  // Get order by ID
  getById: (orderId) => {
    const orders = getData(STORAGE_KEYS.ORDERS, []);
    return orders.find(o => o.id === orderId) || null;
  },

  // Get orders by user ID
  getByUserId: (userId) => {
    const orders = getData(STORAGE_KEYS.ORDERS, []);
    return orders.filter(o => o.userId === userId);
  },

  // Get orders by status
  getByStatus: (status) => {
    const orders = getData(STORAGE_KEYS.ORDERS, []);
    return orders.filter(o => o.status === status);
  },

  // Create new order
  create: (orderData) => {
    try {
      const orders = getData(STORAGE_KEYS.ORDERS, []);
      console.log('OrderStore.create - Current orders:', orders.length);
      
      const newOrder = {
        id: 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: orderData.userId || null,
        items: orderData.items || [],
        total: orderData.total || 0,
        customerInfo: orderData.customerInfo || {},
        paymentScreenshot: orderData.paymentScreenshot || null,
        status: 'pending',
        paymentStatus: orderData.paymentScreenshot ? 'pending' : 'not_uploaded',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('OrderStore.create - New order:', newOrder);
      
      orders.push(newOrder);
      const saved = saveData(STORAGE_KEYS.ORDERS, orders);
      
      console.log('OrderStore.create - Save result:', saved);
      console.log('OrderStore.create - Total orders now:', orders.length);
      
      // Verify save
      const verifyOrders = getData(STORAGE_KEYS.ORDERS, []);
      console.log('OrderStore.create - Verified orders:', verifyOrders.length);
      
      return { success: true, order: newOrder };
    } catch (error) {
      console.error('OrderStore.create - Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update order
  update: (orderId, updates) => {
    const orders = getData(STORAGE_KEYS.ORDERS, []);
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index === -1) {
      return { success: false, error: 'Order not found' };
    }

    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveData(STORAGE_KEYS.ORDERS, orders);
    return { success: true, order: orders[index] };
  },

  // Update order status
  updateStatus: (orderId, status) => {
    return OrderStore.update(orderId, { status });
  },

  // Update payment status
  updatePaymentStatus: (orderId, paymentStatus) => {
    return OrderStore.update(orderId, { paymentStatus });
  },

  // Delete order
  delete: (orderId) => {
    const orders = getData(STORAGE_KEYS.ORDERS, []);
    const filtered = orders.filter(o => o.id !== orderId);
    saveData(STORAGE_KEYS.ORDERS, filtered);
    return { success: true };
  },

  // Get order statistics
  getStats: () => {
    const orders = getData(STORAGE_KEYS.ORDERS, []);
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      approved: orders.filter(o => o.status === 'approved').length,
      rejected: orders.filter(o => o.status === 'rejected').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders
        .filter(o => ['approved', 'shipped', 'delivered'].includes(o.status))
        .reduce((sum, o) => sum + (o.total * 1.18), 0),
    };
  },
};

// ==================== CART MANAGEMENT ====================

export const CartStore = {
  // Get cart items
  getItems: () => getData(STORAGE_KEYS.CART, []),

  // Add item to cart
  addItem: (product) => {
    const cart = getData(STORAGE_KEYS.CART, []);
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    saveData(STORAGE_KEYS.CART, cart);
    return { success: true, cart };
  },

  // Remove item from cart
  removeItem: (productId) => {
    const cart = getData(STORAGE_KEYS.CART, []);
    const filtered = cart.filter(item => item.id !== productId);
    saveData(STORAGE_KEYS.CART, filtered);
    return { success: true, cart: filtered };
  },

  // Update item quantity
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      return CartStore.removeItem(productId);
    }
    
    const cart = getData(STORAGE_KEYS.CART, []);
    const index = cart.findIndex(item => item.id === productId);
    
    if (index !== -1) {
      cart[index].quantity = quantity;
      saveData(STORAGE_KEYS.CART, cart);
    }
    
    return { success: true, cart };
  },

  // Clear cart
  clear: () => {
    saveData(STORAGE_KEYS.CART, []);
    return { success: true };
  },

  // Get cart total
  getTotal: () => {
    const cart = getData(STORAGE_KEYS.CART, []);
    return cart.reduce((total, item) => {
      const price = parseInt(item.price.replace(/[₹,]/g, ''));
      return total + price * item.quantity;
    }, 0);
  },

  // Get cart count
  getCount: () => {
    const cart = getData(STORAGE_KEYS.CART, []);
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
};

// ==================== PRODUCT MANAGEMENT ====================

export const ProductStore = {
  // Default products
  defaultProducts: [
    { id: 1, name: 'Noise-cancel Bluetooth Headphones Pro', category: 'electronics', price: '₹4,999', stock: 40, image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&w=400' },
    { id: 2, name: 'Smart Fitness Band OLED', category: 'electronics', price: '₹2,499', stock: 55, image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&w=400' },
    { id: 3, name: 'USB-C Fast Charger 65W', category: 'electronics', price: '₹1,299', stock: 80, image: 'https://images.pexels.com/photos/163117/keyboard-full-clean-workspace-163117.jpeg?auto=compress&w=400' },
  ],

  // Get all products
  getAll: () => {
    const products = getData(STORAGE_KEYS.PRODUCTS, null);
    if (!products || products.length === 0) {
      saveData(STORAGE_KEYS.PRODUCTS, ProductStore.defaultProducts);
      return ProductStore.defaultProducts;
    }
    return products;
  },

  // Get product by ID
  getById: (productId) => {
    const products = ProductStore.getAll();
    return products.find(p => p.id === productId) || null;
  },

  // Add product
  add: (product) => {
    const products = ProductStore.getAll();
    const newProduct = {
      ...product,
      id: Date.now(),
    };
    products.push(newProduct);
    saveData(STORAGE_KEYS.PRODUCTS, products);
    return { success: true, product: newProduct };
  },

  // Update product
  update: (productId, updates) => {
    const products = ProductStore.getAll();
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) {
      return { success: false, error: 'Product not found' };
    }

    products[index] = { ...products[index], ...updates };
    saveData(STORAGE_KEYS.PRODUCTS, products);
    return { success: true, product: products[index] };
  },

  // Delete product
  delete: (productId) => {
    const products = ProductStore.getAll();
    const filtered = products.filter(p => p.id !== productId);
    saveData(STORAGE_KEYS.PRODUCTS, filtered);
    return { success: true };
  },
};

// ==================== DATA SYNC ====================

export const DataSync = {
  // Force refresh all data from localStorage
  refresh: () => {
    return {
      users: UserStore.getAll(),
      orders: OrderStore.getAll(),
      cart: CartStore.getItems(),
      products: ProductStore.getAll(),
      currentUser: UserStore.getCurrentUser(),
    };
  },

  // Export all data (for backup)
  exportAll: () => {
    return {
      users: UserStore.getAll(),
      orders: OrderStore.getAll(),
      products: ProductStore.getAll(),
      exportedAt: new Date().toISOString(),
    };
  },

  // Import data (restore from backup)
  importAll: (data) => {
    if (data.users) saveData(STORAGE_KEYS.USERS, data.users);
    if (data.orders) saveData(STORAGE_KEYS.ORDERS, data.orders);
    if (data.products) saveData(STORAGE_KEYS.PRODUCTS, data.products);
    return { success: true };
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return { success: true };
  },
};

export default {
  UserStore,
  OrderStore,
  CartStore,
  ProductStore,
  DataSync,
  STORAGE_KEYS,
};
