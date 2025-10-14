// pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { useFormik } from 'formik';
import { resetPasswordValidationSchema } from '../utils/authValidations';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await axios.post('/users/reset-password', {
          email,
          otp,
          newPassword: values.newPassword
        });
        
        if (response.data.success) {
          toast.success(response.data.message);
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please log in with your new password.' 
            }
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    }
  });

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 3) return 'bg-yellow-500';
    if (strength < 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength < 2) return 'Weak';
    if (strength < 3) return 'Fair';
    if (strength < 4) return 'Good';
    return 'Strong';
  };

  const passwordStrength = getPasswordStrength(formik.values.newPassword);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500/10 rounded-full mb-4">
            <Lock className="w-8 h-8 text-lime-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-neutral-400">
            Create a new strong password for your account
          </p>
        </div>

        {/* Form */}
        <div className="bg-neutral-800 rounded-lg p-6 shadow-xl">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-12 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-lime-500 ${
                    formik.touched.newPassword && formik.errors.newPassword ? 'border-red-500' : 'border-neutral-600'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formik.values.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-700 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400">{getStrengthText(passwordStrength)}</span>
                  </div>
                </div>
              )}

              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="mt-1 text-sm text-red-400">{formik.errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-12 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-lime-500 ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-neutral-600'
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formik.values.confirmPassword && formik.values.newPassword && (
                <div className="mt-2">
                  {formik.values.newPassword === formik.values.confirmPassword ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle size={16} />
                      <span className="text-sm">Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <span className="text-sm">Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}

              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{formik.errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-neutral-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li className={formik.values.newPassword.length >= 6 ? 'text-green-500' : ''}>
                  • At least 6 characters
                </li>
                <li className={/[a-z]/.test(formik.values.newPassword) ? 'text-green-500' : ''}>
                  • One lowercase letter
                </li>
                <li className={/[A-Z]/.test(formik.values.newPassword) ? 'text-green-500' : ''}>
                  • One uppercase letter
                </li>
                <li className={/\d/.test(formik.values.newPassword) ? 'text-green-500' : ''}>
                  • One number
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formik.isValid}
              className="w-full bg-lime-500 text-neutral-900 py-3 rounded-lg font-medium hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back Button */}
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
      </div>
    </div>
  );
};

export default ResetPassword;