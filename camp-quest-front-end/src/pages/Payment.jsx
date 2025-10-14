import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const Payment = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    const data = sessionStorage.getItem('orderData');
    if (!data) {
      navigate('/checkout');
      return;
    }
    setOrderData(JSON.parse(data));
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 16) return;
      formattedValue = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 3) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handlePayment = async () => {
    // Validate card details if card payment
    if (paymentMethod === 'card') {
      if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardData.cardName.trim()) {
        toast.error('Please enter cardholder name');
        return;
      }
      if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
        toast.error('Please enter valid expiry date (MM/YY)');
        return;
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        toast.error('Please enter valid CVV');
        return;
      }
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Creating order with data:', orderData);

      // Create order
      const response = await axios.post('/orders', {
        ...orderData,
        paymentMethod,
        paymentStatus: 'completed',
        paymentDetails: {
          method: paymentMethod,
          transactionId: 'TXN' + Date.now(),
          amount: orderData.totalAmount
        }
      });

      console.log('Order creation response:', response.data);

      // Get the order ID from response - handle different response structures
      let createdOrderId;
      
      if (response.data.data && response.data.data._id) {
        createdOrderId = response.data.data._id;
      } else if (response.data.order && response.data.order._id) {
        createdOrderId = response.data.order._id;
      } else if (response.data._id) {
        createdOrderId = response.data._id;
      }

      console.log('Created Order ID:', createdOrderId);

      if (!createdOrderId) {
        throw new Error('Order ID not found in response');
      }

      // Clear cart and session storage
      clearCart();
      sessionStorage.removeItem('orderData');

      // Navigate to success page with order ID
      navigate('/success', { 
        state: { 
          orderId: createdOrderId
        } 
      });
      
      toast.success('Payment successful!');
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 bg-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4 text-lime-500"
                  />
                  <CreditCard className="mr-3 text-lime-500" size={20} />
                  <span className="text-white">Credit/Debit Card</span>
                </label>
                
                <label className="flex items-center p-4 bg-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-600 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4 text-lime-500"
                  />
                  <span className="text-white">PayPal</span>
                </label>
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Card Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={cardData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PayPal */}
            {paymentMethod === 'paypal' && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <div className="text-center py-8">
                  <p className="text-neutral-400 mb-4">
                    You will be redirected to PayPal to complete your payment
                  </p>
                  <div className="inline-block p-4 bg-neutral-700 rounded-lg">
                    <span className="text-2xl font-bold text-blue-500">PayPal</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-neutral-800 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="flex-1">
                      <p className="text-white text-sm">{item.name}</p>
                      <p className="text-neutral-400 text-xs">
                        {item.type === 'sale' 
                          ? `Qty: ${item.quantity}`
                          : `${item.quantity} × ${item.rentalDays} days`
                        }
                      </p>
                    </div>
                    <span className="text-white">LKR {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">LKR {(orderData.totalAmount - 450).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Delivery</span>
                  <span className="text-white">LKR 450.00</span>
                </div>
                <div className="border-t border-neutral-700 pt-2 flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-lime-500">LKR {orderData.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-6 px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg font-medium hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-900"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Pay LKR {orderData.totalAmount.toFixed(2)}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-xs text-neutral-400">
                <Lock size={12} className="mr-1" />
                <p>Secure SSL Encrypted Payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;