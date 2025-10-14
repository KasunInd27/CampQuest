// context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
    localStorage.removeItem('cart');
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