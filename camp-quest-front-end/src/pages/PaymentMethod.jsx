import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Upload, FileText, Check, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const PaymentMethod = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null); // 'card' or 'slip'
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Load order data from session storage
    const [orderData, setOrderData] = useState(() => {
        try {
            const stored = sessionStorage.getItem('orderData');
            return stored ? JSON.parse(stored) : null;
        } catch (err) {
            console.error('Failed to parse order data', err);
            return null;
        }
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Validate size (24MB)
        if (selectedFile.size > 24 * 1024 * 1024) {
            toast.error('File size must be less than 24MB');
            return;
        }

        // Validate type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error('Only PDF, JPG, and PNG files are allowed');
            return;
        }

        setFile(selectedFile);

        // Create preview
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreviewUrl(null); // No preview for PDF
        }
    };

    const handleCardClick = () => {
        toast.error('Card payments are temporarily suspended. Please upload a payment slip.', {
            duration: 4000,
            icon: '🚫'
        });
    };

    const handleSubmit = async () => {
        if (!orderData) return;

        setLoading(true);
        try {
            // 1. Create Order First
            // Clean up order data if needed before sending
            const orderPayload = { ...orderData };

            // Ensure payment details match method (initially slip)
            orderPayload.paymentDetails = {
                ...orderPayload.paymentDetails,
                method: 'slip' // Default to slip for initial creation if this path is taken
            };

            const createResponse = await axios.post('/orders', orderPayload);

            if (!createResponse.data.success) {
                throw new Error(createResponse.data.message || 'Failed to create order');
            }

            const orderId = createResponse.data.data._id;
            const orderNumber = createResponse.data.data.orderNumber;

            // 2. Upload Slip
            if (file) {
                const formData = new FormData();
                formData.append('paymentSlip', file);

                await axios.post(`/orders/${orderId}/upload-slip`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                });
            }

            // 3. Clear Cart and Redirect
            clearCart();
            sessionStorage.removeItem('orderData');

            // Navigate to success page with order details
            navigate('/success', {
                state: {
                    orderNumber: orderNumber,
                    orderId: orderId,
                    email: orderData.customer.email
                }
            });

        } catch (error) {
            console.error('Payment processing error:', error);
            toast.error(error.response?.data?.message || 'Failed to process payment');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    if (!orderData) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full place-items-center space-y-8 bg-neutral-800 p-10 rounded-xl shadow-lg border border-neutral-700 text-center">
                    <div className="mx-auto h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="mt-2 text-2xl font-bold text-white">Payment session not found</h2>
                        <p className="mt-2 text-sm text-neutral-400">
                            Your checkout session expired or was refreshed. Please go back to Checkout to restore your session.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-neutral-900 bg-lime-500 hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
                        >
                            Back to Checkout
                        </button>
                        <button
                            onClick={() => navigate('/cart')}
                            className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors"
                        >
                            Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-white mb-2">Payment Method</h1>
                <p className="text-neutral-400 mb-8">Choose how you would like to pay for your order.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Bank Transfer / Slip Upload Option */}
                    <div
                        onClick={() => setSelectedMethod('slip')}
                        className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${selectedMethod === 'slip'
                            ? 'border-lime-500 bg-neutral-800'
                            : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                            }`}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${selectedMethod === 'slip' ? 'bg-lime-500/20 text-lime-500' : 'bg-neutral-700 text-neutral-400'
                                }`}>
                                <Upload size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Upload Payment Slip</h3>
                            <p className="text-sm text-neutral-400">Bank deposit or transfer receipt</p>
                            {selectedMethod === 'slip' && (
                                <div className="mt-4 text-lime-500">
                                    <Check size={20} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Payment Option (Disabled) */}
                    <div
                        onClick={handleCardClick}
                        className="cursor-not-allowed rounded-xl p-6 border-2 border-neutral-800 bg-neutral-800/30 opacity-70"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center mb-4">
                                <CreditCard size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-400 mb-2">Card Payment</h3>
                            <p className="text-sm text-neutral-500">Temporarily Unavailable</p>
                            <div className="mt-4 text-red-500/50">
                                <AlertCircle size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slip Upload UI */}
                {selectedMethod === 'slip' && (
                    <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700 animate-fadeIn">
                        <h2 className="text-xl font-bold text-white mb-6">Upload Payment Receipt</h2>

                        {/* Bank Details */}
                        <div className="bg-neutral-700/50 rounded-lg p-6 mb-8 border border-neutral-700 relative group">
                            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Bank Details</h3>
                            <div className="space-y-2 text-white font-mono text-sm">
                                <p><span className="text-neutral-500 w-24 inline-block font-sans">Name:</span> P.A.S.V.Pathiraja</p>
                                <p><span className="text-neutral-500 w-24 inline-block font-sans">Acc No:</span> <span className="text-lg font-bold">019020641469</span></p>
                                <p><span className="text-neutral-500 w-24 inline-block font-sans">Bank:</span> HNB Bank</p>
                                <p><span className="text-neutral-500 w-24 inline-block font-sans">Branch:</span> Kurunegala</p>
                            </div>
                            <div className="absolute top-4 right-4 text-xs text-lime-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                Copy details manually
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Attachment (PDF, JPG, PNG - Max 24MB)
                            </label>

                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file
                                        ? 'border-lime-500 bg-lime-500/5'
                                        : 'border-neutral-600 bg-neutral-700/30 hover:bg-neutral-700/50 hover:border-neutral-500'
                                        }`}
                                >
                                    {file ? (
                                        <div className="text-center p-4">
                                            {previewUrl ? (
                                                <div className="mb-2 max-h-32 overflow-hidden rounded border border-neutral-600 inline-block">
                                                    <img src={previewUrl} alt="Preview" className="max-h-32 max-w-full" />
                                                </div>
                                            ) : (
                                                <FileText size={48} className="mx-auto text-lime-500 mb-2" />
                                            )}
                                            <p className="text-sm text-lime-400 font-medium truncate max-w-sm mx-auto">{file.name}</p>
                                            <p className="text-xs text-neutral-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            <p className="text-xs text-lime-500 mt-2 font-medium">Click to change file</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-10 h-10 text-neutral-400 mb-3" />
                                            <p className="mb-2 text-sm text-neutral-300">
                                                <span className="font-semibold text-lime-400">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-neutral-500">PDF, PNG, JPG (MAX. 24MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !file}
                            className="w-full mt-8 bg-lime-500 text-neutral-900 py-3 rounded-lg font-bold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    {uploadProgress > 0 && uploadProgress < 100
                                        ? `Uploading ${uploadProgress}%...`
                                        : 'Processing Order...'}
                                </>
                            ) : (
                                'Submit Payment'
                            )}
                        </button>

                        <p className="text-center text-xs text-neutral-500 mt-4">
                            Your order will be verified within 1 business day after submission.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentMethod;
