// context/CartContext.jsx
/* eslint-disable react-refresh/only-export-components */

import React, { useState, createContext, useContext } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Portable Camping Stove',
      price: 89.99,
      image: 'https://uploadthingy.s3.us-west-1.amazonaws.com/gFzUPEiiyGQMoU8tcXjokv/image.png',
      quantity: 1,
      reviews: 86,
      rating: 4,
    },
    {
      id: '2',
      name: 'Hiking Backpack',
      price: 129.99,
      image: 'https://uploadthingy.s3.us-west-1.amazonaws.com/qWcfhKujHisDCG5dJX3zpA/image.png',
      quantity: 1,
      reviews: 92,
      rating: 4,
    },
  ]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + 1,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}