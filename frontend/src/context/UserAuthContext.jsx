import { createContext, useContext, useState, useEffect } from 'react';
import { UserStore, OrderStore, CartStore } from '../assets/data/dataStore';
import { canCallApi } from '../services/productsApi';
import { listOrdersByUserId } from '../services/operationsApi';

const UserAuthContext = createContext();

function notifyAuthChanged() {
  window.dispatchEvent(new Event('goldymart-auth-changed'));
}

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = UserStore.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserOrders(currentUser.id);
    }
    setIsLoading(false);
  }, []);

  const loadUserOrders = async (userId) => {
    if (canCallApi()) {
      try {
        const list = await listOrdersByUserId(userId);
        setOrders(list);
      } catch {
        setOrders([]);
      }
      return;
    }
    setOrders(OrderStore.getByUserId(userId));
  };

  const refreshOrders = () => {
    if (user) {
      loadUserOrders(user.id);
    }
  };

  // Sign up
  const signup = async (userData) => {
    const result = UserStore.create(userData);
    if (result.success) {
      // Auto login after signup
      const loginResult = UserStore.login(userData.email, userData.password);
      if (loginResult.success) {
        setUser(loginResult.user);
        loadUserOrders(loginResult.user.id);
        notifyAuthChanged();
        return { success: true, user: loginResult.user };
      }
    }
    return result;
  };

  // Login
  const login = async (email, password) => {
    const result = UserStore.login(email, password);
    if (result.success) {
      setUser(result.user);
      loadUserOrders(result.user.id);
      notifyAuthChanged();
    }
    return result;
  };

  // Logout
  const logout = () => {
    UserStore.logout();
    setUser(null);
    setOrders([]);
    CartStore.clear();
    window.dispatchEvent(new Event('goldymart-logout-cart'));
    notifyAuthChanged();
  };

  // Update profile
  const updateProfile = (updates) => {
    if (!user) return { success: false, error: 'Not logged in' };
    
    const result = UserStore.update(user.id, updates);
    if (result.success) {
      setUser(result.user);
      // Update current user in localStorage
      localStorage.setItem('goldymart_current_user', JSON.stringify(result.user));
    }
    return result;
  };

  // Place order
  const placeOrder = (orderData) => {
    const result = OrderStore.create({
      ...orderData,
      userId: user?.id || null,
    });
    
    if (result.success) {
      // Clear cart after order
      CartStore.clear();
      
      // Refresh orders if user is logged in
      if (user) {
        loadUserOrders(user.id);
      }
    }
    
    return result;
  };

  // Get user's orders
  const getUserOrders = () => {
    if (!user) return [];
    if (canCallApi()) return orders;
    return OrderStore.getByUserId(user.id);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    orders,
    signup,
    login,
    logout,
    updateProfile,
    placeOrder,
    getUserOrders,
    refreshOrders,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};

export default UserAuthContext;
