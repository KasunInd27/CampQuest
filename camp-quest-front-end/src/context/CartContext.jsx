// context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Helper to get the correct storage key based on current user
  const getStorageKey = (currentUser) => {
    if (currentUser) {
      const userId = currentUser._id || currentUser.id;
      if (userId) {
        return `cart_${userId}`;
      }
    }
    return 'cart_guest';
  };

  // Load cart when user changes (or on initial load)
  useEffect(() => {
    if (loading) return; // Wait for auth to settle

    const key = getStorageKey(user);
    console.log(`[CartContext] User changed. Loading cart from key: ${key}`, user);

    try {
      const storedCart = localStorage.getItem(key);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
        console.log(`[CartContext] Loaded ${JSON.parse(storedCart).length} items from ${key}`);
      } else {
        setCartItems([]);
        console.log(`[CartContext] Key ${key} is empty. Initializing empty cart.`);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    }
  }, [user, loading]);

  // Helper to save cart to the correct key
  const saveCart = (items) => {
    const key = getStorageKey(user);
    console.log(`[CartContext] Saving ${items.length} items to ${key}`);
    localStorage.setItem(key, JSON.stringify(items));
    setCartItems(items);
  };

  const addToCart = (product, type = 'sale', rentalDays = 1) => {
    const existingItem = cartItems.find(
      item => item._id === product._id && item.type === type
    );

    let newItems;
    if (existingItem) {
      if (type === 'sale') {
        newItems = cartItems.map(item =>
          item._id === product._id && item.type === type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast.error('This rental item is already in your cart');
        return;
      }
    } else {
      const newItem = {
        ...product,
        type,
        quantity: 1,
        rentalDays: type === 'rental' ? rentalDays : null,
        price: type === 'sale' ? product.price : product.dailyRate
      };
      newItems = [...cartItems, newItem];
      toast.success('Added to cart');
    }

    saveCart(newItems);
  };

  const updateQuantity = (productId, type, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, type);
      return;
    }

    const newItems = cartItems.map(item =>
      item._id === productId && item.type === type
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(newItems);
  };

  const updateRentalDays = (productId, days) => {
    const newItems = cartItems.map(item =>
      item._id === productId && item.type === 'rental'
        ? { ...item, rentalDays: days }
        : item
    );
    saveCart(newItems);
  };

  const removeFromCart = (productId, type) => {
    const newItems = cartItems.filter(
      item => !(item._id === productId && item.type === type)
    );
    saveCart(newItems);
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.type === 'sale'
        ? item.price * item.quantity
        : item.price * item.rentalDays * item.quantity;
      return total + itemPrice;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    updateRentalDays,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    isCartOpen,
    setIsCartOpen
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
