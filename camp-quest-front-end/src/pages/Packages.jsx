import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Upload, X, Eye } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { uploadImage } from '../lib/uploadImage';
import { resolveImageUrl } from '../lib/imageHelper';

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        description: Yup.string().required('Description is required'),
        price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
        includes: Yup.string().required('Includes list is required (comma separated)'),
        isActive: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            price: '',
            includes: '',
            isActive: true
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                let imageUrl = editingPackage?.imageUrl;

                if (selectedImage) {
                    const uploadResult = await uploadImage(selectedImage);
                    imageUrl = uploadResult.url;
                }

                if (!imageUrl) {
                    toast.error("Please upload an image");
                    setLoading(false);
                    return;
                }

                const payload = {
                    ...values,
                    includes: values.includes.split(',').map(item => item.trim()).filter(Boolean),
                    imageUrl
                };

                if (editingPackage) {
                    await axios.put(`/packages/${editingPackage._id}`, payload);
                    toast.success('Package updated successfully');
                } else {
                    await axios.post('/packages', payload);
                    toast.success('Package created successfully');
                }

                resetForm();
                fetchPackages();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to save package');
                console.error("Save error:", error);
            } finally {
                setLoading(false);
            }
        }
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await axios.get('/packages');
            setPackages(response.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch packages');
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        formik.setValues({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            includes: pkg.includes.join(', '),
            isActive: pkg.isActive
        });
        setImagePreview(resolveImageUrl(pkg.imageUrl));
        setShowCreateForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await axios.delete(`/packages/${id}`);
                toast.success('Package deleted successfully');
                fetchPackages();
            } catch (error) {
                toast.error('Failed to delete package');
            }
        }
    };

    const resetForm = () => {
        formik.resetForm();
        setEditingPackage(null);
        setShowCreateForm(false);
        setSelectedImage(null);
        setImagePreview(null);
    };

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !showCreateForm) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Special Packages</h1>
                    <p className="text-neutral-400">Manage your special curated packages</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 font-medium transition-colors"
                >
                    <Plus size={20} />
                    Add Package
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                <input
                    type="text"
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-lime-500"
                />
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => (
                    <div key={pkg._id} className="bg-neutral-900 rounded-lg border border-neutral-700 hover:border-lime-500 transition-colors flex flex-col h-full">
                        <div className="relative h-48 bg-neutral-800">
                            <img
                                src={resolveImageUrl(pkg.imageUrl)}
                                alt={pkg.name}
                                className="w-full h-full object-cover rounded-t-lg"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    onClick={() => handleEdit(pkg)}
                                    className="p-1.5 bg-neutral-900/80 text-neutral-400 hover:text-lime-500 rounded transition-colors"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(pkg._id)}
                                    className="p-1.5 bg-neutral-900/80 text-neutral-400 hover:text-red-400 rounded transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-white text-lg">{pkg.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs ${pkg.isActive ? 'bg-lime-500/20 text-lime-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {pkg.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-neutral-400 text-sm line-clamp-2 mb-4 flex-1">{pkg.description}</p>

                            <div className="mt-auto">
                                <p className="text-lime-500 font-bold text-xl">LKR {pkg.price}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPackages.length === 0 && (
                <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-neutral-600" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-400">No packages found</h3>
                    <p className="mt-1 text-sm text-neutral-500">Get started by adding a new special package.</p>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000] overflow-y-auto">
                    <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingPackage ? 'Edit Package' : 'Add New Package'}
                        </h2>

                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">
                                    Package Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-neutral-600'}`}
                                    placeholder="e.g. Weekend Warrior Pack"
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="mt-1 text-sm text-red-400">{formik.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-neutral-600'}`}
                                    placeholder="Package description"
                                    rows="3"
                                />
                                {formik.touched.description && formik.errors.description && (
                                    <p className="mt-1 text-sm text-red-400">{formik.errors.description}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">
                                    Price (LKR) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formik.values.price}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.price && formik.errors.price ? 'border-red-500' : 'border-neutral-600'}`}
                                    placeholder="0.00"
                                />
                                {formik.touched.price && formik.errors.price && (
                                    <p className="mt-1 text-sm text-red-400">{formik.errors.price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">
                                    Includes (comma separated) *
                                </label>
                                <textarea
                                    name="includes"
                                    value={formik.values.includes}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.includes && formik.errors.includes ? 'border-red-500' : 'border-neutral-600'}`}
                                    placeholder="Tent, Sleeping Bag, Flashlight"
                                    rows="2"
                                />
                                {formik.touched.includes && formik.errors.includes && (
                                    <p className="mt-1 text-sm text-red-400">{formik.errors.includes}</p>
                                )}
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">
                                    Package Image *
                                </label>
                                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-4 text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <Upload className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                                        <p className="text-neutral-400">Click to upload image</p>
                                    </label>
                                </div>

                                {imagePreview && (
                                    <div className="mt-4 relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formik.values.isActive}
                                    onChange={formik.handleChange}
                                    className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-neutral-600 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 text-sm text-neutral-300">
                                    Active Package
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="flex-1 px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formik.isSubmitting ? 'Saving...' : (editingPackage ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Packages;
