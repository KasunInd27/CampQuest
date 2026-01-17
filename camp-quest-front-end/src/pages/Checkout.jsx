// pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, User, Calendar, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import { checkoutValidationSchema } from '../utils/checkoutValidations';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);

  const hasRentalItems = cartItems.some(item => item.type === 'rental');
  const hasSaleItems = cartItems.some(item => item.type === 'sale');
  const isRentalOnly = hasRentalItems && !hasSaleItems;

  // Calculate rental days
  const calculateRentalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  // Calculate cart total with rental days
  const calculateCartTotal = (startDate = null, endDate = null) => {
    const rentalDays = hasRentalItems && startDate && endDate
      ? calculateRentalDays(startDate, endDate)
      : 1;

    return cartItems.reduce((total, item) => {
      if (item.type === 'rental') {
        return total + (item.price * rentalDays * item.quantity);
      } else {
        return total + (item.price * item.quantity);
      }
    }, 0);
  };

  const formik = useFormik({
    initialValues: {
      // Personal Information
      name: user?.name || '',
      email: user?.email || '',
      phone: '',

      // Delivery Information
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'SL',

      // Rental Specific (if applicable)
      startDate: '',
      endDate: '',

      // Additional
      notes: ''
    },
    validationSchema: checkoutValidationSchema,
    context: { hasRentalItems, hasSaleItems }, // Pass flags to validations
    onSubmit: async (values) => {
      setLoading(true);

      try {
        // Validate form data before sending
        console.log('Form values:', values);

        // Check required fields (Delivery info only required for sales)
        if (hasSaleItems && (!values.address || !values.city || !values.state || !values.postalCode)) {
          toast.error('Please fill in all delivery address fields');
          setLoading(false);
          return;
        }

        // Calculate rental days if applicable
        const rentalDays = hasRentalItems ? calculateRentalDays(values.startDate, values.endDate) : 0;

        // Determine order type
        const orderType = isRentalOnly ? 'rental' : 'sales';

        // Calculate total amount
        const subtotal = calculateCartTotal(values.startDate, values.endDate);
        const tax = 0;
        const shippingCost = hasSaleItems ? 450 : 0;
        const totalAmount = subtotal + tax + shippingCost;

        // Prepare order data with explicit structure
        const orderData = {
          orderType: orderType,
          customer: {
            name: values.name.trim(),
            email: values.email.trim(),
            phone: values.phone.trim()
          },
          // Only include delivery address if sales items exist
          ...(hasSaleItems && {
            deliveryAddress: {
              address: values.address.trim(),
              city: values.city.trim(),
              state: values.state.trim(),
              postalCode: values.postalCode.trim(),
              country: values.country || 'SL'
            }
          }),
          items: cartItems.map(item => {
            const baseItem = {
              product: item._id,
              productModel: item.type === 'rental' ? 'RentalProduct' : 'SalesProduct',
              name: item.name,
              type: item.type,
              quantity: item.quantity,
              price: item.price
            };

            // Add rental-specific fields for rental items
            if (item.type === 'rental' && hasRentalItems) {
              baseItem.rentalDays = rentalDays;
              baseItem.rentalStartDate = new Date(values.startDate);
              baseItem.rentalEndDate = new Date(values.endDate);
              baseItem.subtotal = item.price * rentalDays * item.quantity;
            } else {
              baseItem.subtotal = item.price * item.quantity;
            }

            return baseItem;
          }),
          // Add rental details at order level if applicable
          ...(hasRentalItems && {
            rentalDetails: {
              startDate: new Date(values.startDate),
              endDate: new Date(values.endDate),
              status: 'pending'
            }
          }),
          paymentDetails: {
            method: 'card',
            amount: totalAmount
          },
          totalAmount: totalAmount,
          tax: tax,
          shippingCost: shippingCost,
          status: 'pending',
          paymentStatus: 'pending',
          priority: 'medium',
          notes: values.notes ? values.notes.trim() : ''
        };

        console.log('Order data being sent:', JSON.stringify(orderData, null, 2));

        // Validate orderData structure before sending (only if sales)
        if (hasSaleItems && !orderData.deliveryAddress?.address) {
          throw new Error('Address is missing from order data');
        }

        // Store order data in session storage for payment page
        sessionStorage.setItem('orderData', JSON.stringify(orderData));

        // Navigate to payment method selection page
        navigate('/payment-method');
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
        console.error('Checkout error:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  // Get current cart total based on selected dates
  const currentSubtotal = calculateCartTotal(formik.values.startDate, formik.values.endDate);
  const currentTax = 0; // Tax is 0
  const currentShipping = hasSaleItems ? 450 : 0;
  const currentTotal = currentSubtotal + currentTax + currentShipping;

  return (
    <div className="min-h-screen bg-neutral-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customer & Delivery Info */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User size={20} />
                Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-neutral-600'
                      }`}
                    placeholder="Enter your full name"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-neutral-600'
                      }`}
                    placeholder="Enter your email address"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-neutral-600'
                      }`}
                    placeholder="+94 77 123 4567"
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Information - Show only if not rental only */}
            {!isRentalOnly && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Delivery Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.address && formik.errors.address ? 'border-red-500' : 'border-neutral-600'
                        }`}
                      placeholder="123 Main Street"
                    />
                    {formik.touched.address && formik.errors.address && (
                      <p className="mt-1 text-sm text-red-400">{formik.errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.city && formik.errors.city ? 'border-red-500' : 'border-neutral-600'
                          }`}
                        placeholder="Enter city"
                      />
                      {formik.touched.city && formik.errors.city && (
                        <p className="mt-1 text-sm text-red-400">{formik.errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formik.values.state}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.state && formik.errors.state ? 'border-red-500' : 'border-neutral-600'
                          }`}
                        placeholder="Enter state"
                      />
                      {formik.touched.state && formik.errors.state && (
                        <p className="mt-1 text-sm text-red-400">{formik.errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formik.values.postalCode}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.postalCode && formik.errors.postalCode ? 'border-red-500' : 'border-neutral-600'
                          }`}
                        placeholder="12345"
                      />
                      {formik.touched.postalCode && formik.errors.postalCode && (
                        <p className="mt-1 text-sm text-red-400">{formik.errors.postalCode}</p>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Rental Dates (if applicable) */}
            {hasRentalItems && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Rental Period
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formik.values.startDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.startDate && formik.errors.startDate ? 'border-red-500' : 'border-neutral-600'
                        }`}
                    />
                    {formik.touched.startDate && formik.errors.startDate && (
                      <p className="mt-1 text-sm text-red-400">{formik.errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formik.values.endDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      min={formik.values.startDate || new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.endDate && formik.errors.endDate ? 'border-red-500' : 'border-neutral-600'
                        }`}
                    />
                    {formik.touched.endDate && formik.errors.endDate && (
                      <p className="mt-1 text-sm text-red-400">{formik.errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Show rental duration */}
                {formik.values.startDate && formik.values.endDate && (
                  <div className="mt-3 p-3 bg-neutral-700 rounded-lg">
                    <p className="text-sm text-neutral-300">
                      Rental Duration: <span className="text-lime-500 font-medium">
                        {calculateRentalDays(formik.values.startDate, formik.values.endDate)} days
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Additional Notes */}
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Additional Notes
              </h2>
              <textarea
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows="3"
                placeholder="Any special instructions or requirements..."
                className={`w-full px-4 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.notes && formik.errors.notes ? 'border-red-500' : 'border-neutral-600'
                  }`}
              />
              {formik.touched.notes && formik.errors.notes && (
                <p className="mt-1 text-sm text-red-400">{formik.errors.notes}</p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-neutral-800 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Order Summary
              </h2>

              {/* Order Type Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${hasRentalItems
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-green-400 bg-green-400/10'
                  }`}>
                  {hasRentalItems ? 'Rental Order' : 'Sales Order'}
                </span>
                {isRentalOnly && (
                  <p className="mt-2 text-xs text-neutral-300 text-center">
                    Rental items are not delivered. Please collect from our shop.
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => {
                  const rentalDays = hasRentalItems && formik.values.startDate && formik.values.endDate
                    ? calculateRentalDays(formik.values.startDate, formik.values.endDate)
                    : (item.rentalDays || 1);

                  const itemTotal = item.type === 'rental'
                    ? (item.price * rentalDays * item.quantity)
                    : (item.price * item.quantity);

                  return (
                    <div key={`${item._id}-${item.type}`} className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-white text-sm">{item.name}</p>
                        <p className="text-neutral-400 text-xs">
                          {item.type === 'sale'
                            ? `Qty: ${item.quantity}`
                            : `${item.quantity} x ${rentalDays} days`
                          }
                        </p>
                      </div>
                      <span className="text-white">
                        LKR {itemTotal.toFixed(2)}/=
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-neutral-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">LKR {currentSubtotal.toFixed(2)}/=</span>
                </div>
                {/* Hide Delivery Fee if rental only */}
                {!isRentalOnly && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Delivery Fee</span>
                    <span className="text-white">LKR {currentShipping.toFixed(2)}/=</span>
                  </div>
                )}
                <div className="border-t border-neutral-700 pt-2 flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-lime-500">LKR {currentTotal.toFixed(2)}/=</span>
                </div>
              </div>

              {/* Show calculation breakdown for rental items */}
              {hasRentalItems && formik.values.startDate && formik.values.endDate && (
                <div className="mt-4 p-3 bg-neutral-700 rounded-lg">
                  <p className="text-xs text-neutral-300 text-center">
                    Rental calculated for {calculateRentalDays(formik.values.startDate, formik.values.endDate)} days
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || formik.isSubmitting || !formik.isValid}
                className="w-full mt-6 px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg font-medium hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                {loading || formik.isSubmitting ? 'Processing...' : 'Proceed to Payment'}
              </button>

              {/* Show validation summary if there are errors */}
              {formik.submitCount > 0 && !formik.isValid && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-medium mb-1">Please fix the following errors:</p>
                  <ul className="text-red-400 text-xs space-y-1">
                    {Object.values(formik.errors).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 text-xs text-neutral-400 text-center">
                <p>✓ Secure SSL Encryption</p>
                <p>✓ Your information is safe with us</p>
                <p>✓ {hasRentalItems ? 'Rental' : 'Sales'} Order</p>
                {!isRentalOnly && <p>✓ Delivery Fee: LKR 450/=</p>}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;