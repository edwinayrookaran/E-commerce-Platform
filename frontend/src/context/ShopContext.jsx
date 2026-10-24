import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, getStoredAuth, storeAuth, clearAuth } from '../api';
import { enrichProduct } from '../catalogHelper';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('fudcy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User state
  const [currentUser, setCurrentUser] = useState(() => getStoredAuth()?.user || null);

  // Modal states
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [sessionMessage, setSessionMessage] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fudcy_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not persist cart:', e);
    }
  }, [cart]);

  // Load products from backend
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError('');
    try {
      const res = await apiFetch('/api/products');
      if (!res.ok) {
        throw new Error('Failed to load products');
      }
      const data = await res.json();
      const enriched = data.map(enrichProduct);
      setProducts(enriched);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductsError('Could not connect to Spring Boot backend. Please ensure the backend is running.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Cart actions
  const addToCart = useCallback((product, amount = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      const stock = Number(product.stockQuantity ?? 99);
      if (existing) {
        const newQty = Math.min(existing.quantity + amount, stock);
        if (newQty <= 0) {
          return current.filter((item) => item.id !== product.id);
        }
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      if (amount <= 0) return current;
      const initialQty = Math.min(amount, stock);
      return [...current, { ...product, quantity: initialQty }];
    });
  }, []);

  const changeQuantity = useCallback((id, amount) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const stock = Number(item.stockQuantity ?? 99);
          const newQty = Math.min(item.quantity + amount, stock);
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Sync added/edited product from Admin
  const handleProductAdded = useCallback((savedProduct) => {
    const enriched = enrichProduct(savedProduct);
    setProducts((current) => {
      const exists = current.some((p) => p.id === enriched.id);
      if (exists) {
        return current.map((p) => (p.id === enriched.id ? enriched : p));
      }
      return [...current, enriched];
    });

    setCart((current) =>
      current.map((item) =>
        item.id === enriched.id ? { ...item, ...enriched } : item
      )
    );
  }, []);

  const handleProductDeleted = useCallback((deletedId) => {
    setProducts((current) => current.filter((p) => p.id !== deletedId));
    setCart((current) => current.filter((item) => item.id !== deletedId));
  }, []);

  // Auth actions
  const login = useCallback((payload) => {
    const token = payload?.token;
    const customer = payload?.user || payload?.customer;
    if (!token || !customer) return;

    const user = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: customer.role,
    };

    storeAuth({
      token,
      expiresAt: payload.expiresAt,
      user,
    });

    setCurrentUser(user);
    setAccountOpen(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Local logout proceeds
    }
    clearAuth();
    setCurrentUser(null);
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('fudcy-auth');
      channel.postMessage({ type: 'logout' });
      channel.close();
    }
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        products,
        loadingProducts,
        productsError,
        refreshProducts: loadProducts,
        cart,
        cartCount,
        cartTotal,
        addToCart,
        changeQuantity,
        removeFromCart,
        clearCart,
        currentUser,
        setCurrentUser,
        login,
        logout,
        isAdmin: currentUser?.role === 'ADMIN',
        cartOpen,
        setCartOpen,
        accountOpen,
        setAccountOpen,
        contactOpen,
        setContactOpen,
        quickViewProduct,
        setQuickViewProduct,
        sessionMessage,
        setSessionMessage,
        handleProductAdded,
        handleProductDeleted,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
