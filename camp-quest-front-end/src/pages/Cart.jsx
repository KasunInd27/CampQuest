import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { BASE_URL } from '../lib/axios';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    updateQuantity,
    updateRentalDays,
    removeFromCart,
    getCartTotal
  } = useCart();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-24 w-24 text-neutral-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-neutral-400 mb-6">Add some items to get started</p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/shop"
              className="px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg font-medium hover:bg-lime-500"
            >
              Shop Now
            </Link>
            <Link
              to="/rent"
              className="px-6 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700"
            >
              Rent Equipment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={`${item._id}-${item.type}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onUpdateRentalDays={updateRentalDays}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={`${item._id}-${item.type}`} className="flex justify-between text-sm">
                    <span className="text-neutral-400 line-clamp-1">{item.name}</span>
                    <span className="text-white">
                      LKR {item.type === 'sale'
                        ? (item.price * item.quantity).toFixed(2)
                        : (item.price * item.rentalDays * item.quantity).toFixed(2)
                      }/=
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-700 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-lime-500">LKR {getCartTotal().toFixed(2)}/=</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg font-medium hover:bg-lime-500 transition-colors"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <div className="mt-4 space-y-2 text-xs text-neutral-400">
                <p>✓ Secure checkout</p>
                <p>✓ 30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, onUpdateQuantity, onUpdateRentalDays, onRemove }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = item.type === 'sale'
    ? `/uploads/sales-products/${item.images?.[0]}`
    : `/uploads/rental-products/${item.images?.[0]}`;

  return (
    <div className="bg-neutral-800 rounded-lg p-4 flex gap-4">
      {/* Product Image */}
      <div className="w-24 h-24 bg-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
        {item.images && item.images.length > 0 ? (
          <img
            src={`${BASE_URL}${imageUrl}`}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-neutral-600" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <h3 className="font-semibold text-white">{item.name}</h3>
          <button
            onClick={() => onRemove(item._id, item.type)}
            className="text-red-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <span className={`text-xs px-2 py-1 rounded ${item.type === 'sale'
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-green-500/20 text-green-400'
            }`}>
            {item.type === 'sale' ? 'Purchase' : 'Rental'}
          </span>
          <span className="text-neutral-400 text-sm">
            LKR {item.price} {item.type === 'rental' && '/day'}.00/=
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item._id, item.type, item.quantity - 1)}
              className="p-1 bg-neutral-700 rounded hover:bg-neutral-600"
            >
              <Minus size={16} className="text-white" />
            </button>
            <span className="text-white w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item._id, item.type, item.quantity + 1)}
              className="p-1 bg-neutral-700 rounded hover:bg-neutral-600"
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>

          {/* Subtotal */}
          <div className="ml-auto">
            <span className="text-lime-500 font-bold">
              LKR {item.type === 'sale'
                ? (item.price * item.quantity).toFixed(2)
                : (item.price * item.rentalDays * item.quantity).toFixed(2)
              }/=
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;