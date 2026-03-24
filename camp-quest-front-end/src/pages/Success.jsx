import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home, Package, AlertCircle } from 'lucide-react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const orderId = location.state?.orderId;

  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Order ID:', orderId);
    console.log('Auth loading:', authLoading);

    if (orderId) {
      if (!authLoading) {
        fetchOrder();
      }
    } else {
      setLoading(false);
      // Don't show error immediately on mount if things are still loading
      if (!authLoading) {
        console.error('No order ID found in location state');
        toast.error('No order ID provided');
      }
    }
  }, [orderId, authLoading]);

  const fetchOrder = async () => {
    try {
      console.log('Fetching order:', orderId);
      const response = await axios.get(`/orders/${orderId}`);
      console.log('Order response:', response.data);

      // Handle different response structures
      const orderData = response.data.data || response.data.order || response.data;
      console.log('Order data:', orderData);

      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!order) {
      toast.error('No order data available');
      return;
    }

    try {
      console.log('Generating PDF for order:', order);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Define colors
      const primaryColor = [132, 204, 22];
      const darkColor = [23, 23, 23];
      const grayColor = [115, 115, 115];

      // ===== HEADER SECTION =====
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 50, 'F');

      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('CampQuest', 20, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Adventure Partner', 20, 35);

      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('INVOICE', pageWidth - 20, 30, { align: 'right' });

      // ===== INVOICE INFO SECTION =====
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

      let yPos = 65;
      doc.setFont('helvetica', 'bold');
      doc.text('CampQuest Inc.', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text('Mathale Road', 20, yPos + 6);
      doc.text('Katupilagolla, Dodamgaslanda', 20, yPos + 12);
      doc.text('Phone: 074 1245 709', 20, yPos + 18);
      doc.text('Email: campquest512@gmail.com', 20, yPos + 24);

      // Right side - Invoice details
      doc.setFontSize(10);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

      const rightX = pageWidth - 20;
      const invoiceNumber = order._id ? order._id.slice(-8).toUpperCase() : 'N/A';

      doc.setFont('helvetica', 'bold');
      doc.text('Invoice No:', rightX - 60, yPos, { align: 'left' });
      doc.setFont('helvetica', 'normal');
      doc.text(`#${invoiceNumber}`, rightX, yPos, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.text('Date:', rightX - 60, yPos + 6, { align: 'left' });
      doc.setFont('helvetica', 'normal');
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(orderDate, rightX, yPos + 6, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.text('Status:', rightX - 60, yPos + 12, { align: 'left' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 197, 94);
      doc.text((order.status || 'pending').toUpperCase(), rightX, yPos + 12, { align: 'right' });

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment:', rightX - 60, yPos + 18, { align: 'left' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 197, 94);
      doc.text('PAID', rightX, yPos + 18, { align: 'right' });

      // ===== BILL TO SECTION =====
      yPos = 110;
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos, pageWidth - 40, 35, 'F');

      yPos += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('BILL TO:', 25, yPos);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(order.customer?.name || 'N/A', 25, yPos + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(order.customer?.email || 'N/A', 25, yPos + 14);
      doc.text(order.customer?.phone || 'N/A', 25, yPos + 20);

      // Delivery address
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

      if (order.orderType === 'rental' || order.orderType === 'package') {
        doc.text('PICKUP AT:', pageWidth / 2 + 10, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text('CampQuest Store', pageWidth / 2 + 10, yPos + 8);
        doc.text('Mathale Road, Katupilagolla', pageWidth / 2 + 10, yPos + 14);
        doc.text('Dodamgaslanda', pageWidth / 2 + 10, yPos + 20);
        doc.text('Status: Pickup Required', pageWidth / 2 + 10, yPos + 26);
      } else {
        doc.text('DELIVER TO:', pageWidth / 2 + 10, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(order.deliveryAddress?.address || 'N/A', pageWidth / 2 + 10, yPos + 8);
        doc.text(
          `${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} ${order.deliveryAddress?.postalCode || order.deliveryAddress?.zipCode || ''}`,
          pageWidth / 2 + 10,
          yPos + 14
        );
        doc.text(order.deliveryAddress?.country || 'N/A', pageWidth / 2 + 10, yPos + 20);
      }

      // ===== ITEMS TABLE =====
      yPos = 155;

      const tableData = (order.items || []).map((item, index) => {
        const itemDescription = item.type === 'sale'
          ? `Purchase (Qty: ${item.quantity})`
          : `Rental (${item.quantity} unit × ${item.rentalDays} days)`;

        const unitPrice = item.type === 'sale'
          ? (item.subtotal / item.quantity)
          : (item.subtotal / (item.quantity * item.rentalDays));

        return [
          index + 1,
          item.name || 'N/A',
          itemDescription,
          item.quantity || 0,
          `LKR ${unitPrice.toFixed(2)}`,
          `LKR ${(item.subtotal || 0).toFixed(2)}`
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Item', 'Description', 'Qty', 'Unit Price', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: darkColor,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'left'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3 // Reduced padding to save space
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 45 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' }
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        }
      });

      // ===== TOTALS SECTION =====
      const finalY = doc.lastAutoTable.finalY + 8; // Tightened gap
      const totalsX = pageWidth - 75;

      const total = order.totalAmount || 0;
      const deliveryfee = 450;

      if (order.orderType === 'rental' || order.orderType === 'package') {
        doc.setFillColor(245, 245, 245);
        doc.rect(totalsX - 10, finalY, 65, 18, 'F'); // Reduced height

        doc.setFontSize(11); // Slightly smaller
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('TOTAL :', totalsX, finalY + 11);
        doc.text(`LKR ${total.toFixed(2)}`, pageWidth - 25, finalY + 11, { align: 'right' });

        // Add rental note closer to totals
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(`This is a ${order.orderType} order. Items are collected from the shop.`, totalsX - 10, finalY + 24);
        doc.text('No delivery charges apply.', totalsX - 10, finalY + 28);
      } else {
        doc.setFillColor(245, 245, 245);
        doc.rect(totalsX - 10, finalY, 65, 32, 'F'); // Reduced height

        doc.setFontSize(9); // Slightly smaller
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('Subtotal:', totalsX, finalY + 7);
        doc.text(`LKR ${(total - deliveryfee).toFixed(2)}`, pageWidth - 25, finalY + 7, { align: 'right' });

        doc.text('Delivery Fee:', totalsX, finalY + 14);
        doc.text(`LKR ${deliveryfee.toFixed(2)}`, pageWidth - 25, finalY + 14, { align: 'right' });

        doc.setLineWidth(0.5);
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.line(totalsX, finalY + 19, pageWidth - 20, finalY + 19);

        doc.setFontSize(11); // Slightly smaller
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('TOTAL:', totalsX, finalY + 26);
        doc.text(`LKR ${total.toFixed(2)}`, pageWidth - 25, finalY + 26, { align: 'right' });
      }

      // ===== PAYMENT INFO =====
      const paymentY = finalY + ((order.orderType === 'rental' || order.orderType === 'package') ? 38 : 42); // Optimized gap
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('Payment Method:', 20, paymentY);
      doc.setFont('helvetica', 'normal');
      const paymentMethodText = order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Payment Slip';
      doc.text(paymentMethodText, 55, paymentY);

      doc.setFont('helvetica', 'bold');
      doc.text('Transaction ID:', 20, paymentY + 5); // Tighter line height
      doc.setFont('helvetica', 'normal');
      doc.text(order.paymentDetails?.transactionId || 'N/A', 55, paymentY + 5);

      // ===== NOTES SECTION =====
      let notesY = paymentY + 15; // Tightened gap

      // Page-break guard replaced with repositioning guard
      const footerLimit = pageHeight - 30;
      if (notesY + 25 > footerLimit) {
        notesY = footerLimit - 25; // Force upward to fit on single page
      }

      // Render NOTES heading explicitly
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9); // Slightly smaller
      doc.setTextColor(0, 0, 0);
      doc.text('NOTES:', 20, notesY);

      // Notes content box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(20, notesY + 3, pageWidth - 40, 18, 'F'); // Reduced height

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('Thank you for choosing CampQuest! We hope you have an amazing adventure.', 25, notesY + 10);
      doc.text('For any queries, please contact us at campquest512@gmail.com or call 074 1245 709.', 25, notesY + 15);

      // ===== FOOTER =====
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);

      doc.setFontSize(7);
      doc.text(`Invoice generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

      const fileName = `CampQuest_Invoice_${invoiceNumber}.pdf`;
      doc.save(fileName);
      toast.success('Invoice downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Order Not Found</h2>
          <p className="text-neutral-400 mb-6">
            We couldn't find the order you're looking for.
            {orderId && <span className="block mt-2 text-sm">Order ID: {orderId}</span>}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg font-medium hover:bg-lime-400 transition-colors"
          >
            <Home size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-800 rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-lime-500 rounded-full p-4 animate-bounce">
              <CheckCircle className="w-16 h-16 text-neutral-900" />
            </div>
          </div>

          {/* Success Message - Payment Verification */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Verification in Progress 🕒
          </h1>
          <p className="text-neutral-400 mb-2">
            Thank you for your order. We have received your payment slip.
          </p>
          <p className="text-neutral-400 mb-8">
            We will verify your payment within <span className="text-lime-500 font-semibold">1 business day</span>.
            Once verified, you will receive a confirmation email at {' '}
            <span className="text-lime-500 font-semibold">{order?.customer?.email}</span>.
          </p>

          {/* Important Notices */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 text-left">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Important Information
            </h3>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
              <li>Please keep your Order Number <strong>#{order._id.slice(-8).toUpperCase()}</strong> for reference.</li>
              <li>If verification is delayed, please contact support with your order number.</li>
              <li>Do not re-upload the slip unless requested by support.</li>
            </ul>
          </div>

          {/* Order Details */}
          <div className="bg-neutral-700 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="text-lime-500" size={24} />
              Order Details
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-neutral-600 pb-2">
                <span className="text-neutral-400">Order ID:</span>
                <span className="text-white font-mono bg-neutral-800 px-3 py-1 rounded">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between border-b border-neutral-600 pb-2">
                <span className="text-neutral-400">Order Date:</span>
                <span className="text-white">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex justify-between border-b border-neutral-600 pb-2">
                <span className="text-neutral-400">Total Amount:</span>
                <div className="text-right">
                  <span className="text-lime-500 font-bold text-lg">
                    LKR {order.totalAmount.toFixed(2)}
                  </span>
                  {(order.orderType === 'rental' || order.orderType === 'package') && (
                    <p className="text-[10px] text-blue-400 italic mt-1">
                      * This is a {order.orderType} order. Items are collected from the shop. No delivery charges apply.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between border-b border-neutral-600 pb-2">
                <span className="text-neutral-400">Payment Status:</span>
                <span className={`flex items-center gap-2 font-semibold ${order.paymentStatus === 'completed' ? 'text-green-400' :
                  order.paymentStatus === 'verification_pending' ? 'text-yellow-400' : 'text-neutral-400'
                  }`}>
                  {order.paymentStatus === 'completed' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {order.paymentStatus === 'verification_pending' ? 'Verification Pending' :
                    order.paymentStatus === 'completed' ? 'Completed' : order.paymentStatus}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400">Order Status:</span>
                <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6 pt-6 border-t border-neutral-600">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Package size={18} className="text-lime-500" />
                Items Ordered ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="bg-neutral-800 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-neutral-400 text-xs mt-1">
                          {item.type === 'sale'
                            ? `Purchase • Quantity: ${item.quantity}`
                            : `Rental • ${item.quantity} unit × ${item.rentalDays} days`
                          }
                        </p>
                      </div>
                      <span className="text-lime-500 font-semibold">
                        LKR {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information / Pickup Info */}
            <div className="mt-6 pt-6 border-t border-neutral-600">
              {(order.orderType === 'rental' || order.orderType === 'package') ? (
                <>
                  <h3 className="text-white font-semibold mb-3">🏪 Pickup Required</h3>
                  <div className="bg-neutral-800 rounded p-4 text-neutral-300 text-sm border-l-4 border-yellow-500">
                    <p className="font-semibold text-white mb-1">
                      {order.orderType === 'package' ? 'This is a special package order.' : 'This is a rental order.'}
                    </p>
                    <p className="mb-2">Please collect your items from our shop. Delivery is not available for {order.orderType === 'package' ? 'packages' : 'rentals'}.</p>
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                      <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Pickup Location:</p>
                      <p className="text-white">CampQuest Store</p>
                      <p>Mathale Road, Katupilagolla</p>
                      <p>Dodamgaslanda</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-white font-semibold mb-3">📍 Delivery Address</h3>
                  {order.deliveryAddress ? (
                    <div className="bg-neutral-800 rounded p-4 text-neutral-300 text-sm">
                      <p className="font-semibold text-white">{order.customer.name}</p>
                      <p className="mt-1">{order.deliveryAddress.address}</p>
                      <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode || order.deliveryAddress.zipCode}</p>
                      <p>{order.deliveryAddress.country}</p>
                      <p className="mt-2 text-neutral-400">📞 {order.customer.phone}</p>
                    </div>
                  ) : (
                    <div className="bg-neutral-800 rounded p-4 text-neutral-300 text-sm">
                      <p className="text-neutral-400 italic">No delivery address provided</p>
                      <p className="mt-2 font-semibold text-white">{order.customer.name}</p>
                      <p className="text-neutral-400">📞 {order.customer.phone}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Estimated Delivery/Pickup */}
            <div className="mt-4 p-4 bg-lime-500/10 border border-lime-500/30 rounded-lg">
              <p className="text-lime-400 text-sm">
                <span className="font-semibold">📦 Estimate:</span>
                {order.deliveryAddress ? ' 3-5 business days for delivery' : ' Ready for pickup within 24 hours (after verification)'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generatePDF}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg font-medium hover:bg-lime-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-lime-500/50"
            >
              <Download size={20} />
              Download Invoice
            </button>

            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-700 text-white rounded-lg font-medium hover:bg-neutral-600 transition-all transform hover:scale-105"
            >
              <Package size={20} />
              View Orders
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-neutral-600 text-white rounded-lg font-medium hover:bg-neutral-700 transition-all transform hover:scale-105"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-neutral-700">
            <p className="text-neutral-400 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@campquest.com" className="text-lime-500 hover:underline">
                campquest512@gmail.com
              </a>
              {' '}or call{' '}
              <a href="tel:+94741245709" className="text-lime-500 hover:underline">
                +94 74 124 5709
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;