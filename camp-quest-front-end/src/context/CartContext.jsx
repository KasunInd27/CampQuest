// context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  // Load cart from localStorage when user changes
  useEffect(() => {
    if (user && user._id) {
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } else {
      // Clear cart if no user logged in
      setCartItems([]);
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user && user._id) {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = (product, type = 'sale', rentalDays = 1) => {
    const existingItem = cartItems.find(
      item => item._id === product._id && item.type === type
    );

    if (existingItem) {
      if (type === 'sale') {
        updateQuantity(product._id, type, existingItem.quantity + 1);
      } else {
        toast.error('This rental item is already in your cart');
      }
    } else {
      const newItem = {
        ...product,
        type,
        quantity: 1,
        rentalDays: type === 'rental' ? rentalDays : null,
        price: type === 'sale' ? product.price : product.dailyRate
      };
      setCartItems([...cartItems, newItem]);
      toast.success('Added to cart');
    }
  };

  const updateQuantity = (productId, type, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, type);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item._id === productId && item.type === type
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const updateRentalDays = (productId, days) => {
    setCartItems(items =>
      items.map(item =>
        item._id === productId && item.type === 'rental'
          ? { ...item, rentalDays: days }
          : item
      )
    );
  };

  const removeFromCart = (productId, type) => {
    setCartItems(items => items.filter(
      item => !(item._id === productId && item.type === type)
    ));
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setCartItems([]);
    if (user && user._id) {
      localStorage.removeItem(`cart_${user._id}`);
    }
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