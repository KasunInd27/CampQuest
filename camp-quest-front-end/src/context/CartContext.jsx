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
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  // Load cart from backend when user logs in
  useEffect(() => {
    const loadCart = async () => {
      if (user && user._id) {
        try {
          const { data } = await axios.get('/cart');
          if (data.success) {
            setCartItems(data.data);
          }
        } catch (error) {
          console.error("Failed to load cart", error);
        }
      } else {
        setCartItems([]);
      }
    };
    loadCart();
  }, [user]);

  // We no longer blindly save to localStorage on every change
  // Backend is the source of truth for logged-in users.

  const addToCart = async (product, type = 'sale', rentalDays = 1) => {
    // 1. Authenticated User Flow (Server Authoritative)
    if (user && user._id) {
      try {
        const { data } = await axios.post('/api/cart', {
          productId: product._id,
          type,
          quantity: 1, // Controller logic handles increment
          rentalDays,
          productModel: type === 'rental' ? 'RentalProduct' : 'SalesProduct'
        });

        if (data.success) {
          setCartItems(data.data); // Source of truth from backend
          toast.success('Added to cart');
        }
      } catch (error) {
        console.error("Failed to add to cart", error);
        toast.error(error.response?.data?.message || 'Failed to add item to cart');
      }
      return;
    }

    // 2. Guest Flow (Local State Only)
    // ... existing local logic for guests ...
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

  const updateQuantity = async (productId, type, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, type);
      return;
    }

    if (user && user._id) {
      try {
        const { data } = await axios.post('/api/cart', {
          productId,
          type,
          quantity: newQuantity,
          productModel: type === 'rental' ? 'RentalProduct' : 'SalesProduct' // Ensure model is passed if needed, though controller infers
        });
        if (data.success) {
          setCartItems(data.data);
        }
      } catch (error) {
        console.error("Failed to update quantity", error);
        toast.error('Failed to update quantity');
      }
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
    // Note: Backend might not support updating rental days in current simple controller without full payload
    // For now, we leave this optimistic.
  };

  const removeFromCart = async (productId, type) => {
    if (user && user._id) {
      try {
        await axios.delete(`/api/cart/${productId}?type=${type}`);
        // If success, update local state
        setCartItems(items => items.filter(
          item => !(item._id === productId && item.type === type)
        ));
        toast.success('Removed from cart');
      } catch (error) {
        console.error("Failed to remove item", error);
        toast.error('Failed to remove item');
      }
      return;
    }

    setCartItems(items => items.filter(
      item => !(item._id === productId && item.type === type)
    ));
    toast.success('Removed from cart');
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user && user._id) {
      try {
        await axios.delete('/api/cart');
      } catch (error) {
        console.error("Failed to clear cart", error);
      }
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
