import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { resolveImageUrl } from '../lib/imageHelper';
import { Package, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PackageDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPackage();
    }, [slug]);

    const fetchPackage = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/packages/${slug}`);
            if (response.data.success) {
                setPkg(response.data.data);
            } else {
                setError('Package not found');
            }
        } catch (error) {
            console.error('Error fetching package:', error);
            setError('Failed to load package details');
        } finally {
            setLoading(false);
        }
    };

    const handleOrderNow = () => {
        if (!pkg) return;

        // Navigate to checkout with package state
        navigate('/checkout', {
            state: {
                package: pkg,
                orderType: 'package'
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
            </div>
        );
    }

    if (error || !pkg) {
        return (
            <div className="min-h-screen bg-white py-20 px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h2>
                <p className="text-gray-600 mb-8">{error || "The package you're looking for doesn't exist."}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-neutral-900">
                <img
                    src={resolveImageUrl(pkg.imageUrl)}
                    alt={pkg.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Packages
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        {pkg.name}
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl">
                        {pkg.description}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <Package className="w-6 h-6 mr-3 text-lime-500" />
                                What's Included
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pkg.includes && pkg.includes.map((item, index) => (
                                    <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                                        <Check className="w-5 h-5 text-lime-500 mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="prose max-w-none text-gray-600">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                            <p>{pkg.description}</p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-6">
                                <p className="text-gray-500 mb-2">Package Price</p>
                                <div className="text-4xl font-bold text-lime-600">
                                    LKR {pkg.price.toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleOrderNow}
                                    className="w-full py-4 bg-lime-500 text-white font-bold text-lg rounded-xl hover:bg-lime-600 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                                >
                                    Order This Package
                                </button>
                                <div className="text-center">
                                    <p className="text-sm text-gray-400 mt-4">
                                        Secure checkout • Instant confirmation
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageDetails;
