// pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import { useFormik } from 'formik';
import { forgotPasswordValidationSchema } from '../utils/authValidations';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await axios.post('/users/forgot-password', values);

        if (response.data.success) {
          toast.success(response.data.message);
          // Navigate to OTP verification with email
          navigate('/verify-otp', {
            state: { email: values.email }
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send OTP');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500/10 rounded-full mb-4">
            <Mail className="w-8 h-8 text-lime-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-neutral-400">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        {/* Form */}
        <div className="bg-neutral-800 rounded-lg p-6 shadow-xl">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-lime-500 ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-neutral-600'
                    }`}
                  placeholder="Enter your email address"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-400">{formik.errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !formik.isValid}
              className="w-full bg-lime-500 text-neutral-900 py-3 rounded-lg font-medium hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-lime-500 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-neutral-500">
          <p>Don't have an account? <Link to="/register" className="text-lime-500 hover:text-lime-400">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;