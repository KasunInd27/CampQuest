// pages/VerifyOTP.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import { useFormik } from 'formik';
import { verifyOTPValidationSchema } from '../utils/authValidations';
import axios from 'axios';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formik = useFormik({
    initialValues: {
      otp: ''
    },
    validationSchema: verifyOTPValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await axios.post('/users/verify-otp', {
          email,
          otp: values.otp
        });
        
        if (response.data.success) {
          toast.success(response.data.message);
          navigate('/reset-password', { 
            state: { email, otp: values.otp }
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Invalid OTP');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOTP = formik.values.otp.split('');
    newOTP[index] = value;
    const otpString = newOTP.join('');
    
    formik.setFieldValue('otp', otpString);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formik.values.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await axios.post('/users/forgot-password', { email });
      
      if (response.data.success) {
        toast.success('OTP resent successfully');
        setTimeLeft(600); // Reset timer
        setCanResend(false);
        formik.setFieldValue('otp', ''); // Clear OTP field
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const otpArray = formik.values.otp.padEnd(6, ' ').split('');

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-lime-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify OTP</h1>
          <p className="text-neutral-400 mb-2">
            We've sent a 6-digit OTP to
          </p>
          <p className="text-lime-500 font-medium">{email}</p>
        </div>

        {/* Form */}
        <div className="bg-neutral-800 rounded-lg p-6 shadow-xl">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-4 text-center">
                Enter 6-digit OTP
              </label>
              <div className="flex gap-2 justify-center mb-2">
                {otpArray.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit.trim()}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-xl font-bold bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${
                      formik.touched.otp && formik.errors.otp ? 'border-red-500' : 'border-neutral-600'
                    }`}
                  />
                ))}
              </div>
              {formik.touched.otp && formik.errors.otp && (
                <p className="text-sm text-red-400 text-center">{formik.errors.otp}</p>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-neutral-400">
                  OTP expires in: <span className="text-lime-500 font-medium">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-red-400">OTP has expired</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formik.isValid || formik.values.otp.length !== 6}
              className="w-full bg-lime-500 text-neutral-900 py-3 rounded-lg font-medium hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="inline-flex items-center gap-2 text-lime-500 hover:text-lime-400 transition-colors disabled:opacity-50"
              >
                {resendLoading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <RefreshCw size={16} />
                )}
                Resend OTP
              </button>
            ) : (
              <p className="text-neutral-500">Didn't receive OTP? Wait {formatTime(timeLeft)} to resend</p>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-lime-500 transition-colors"
            >
              <ArrowLeft size={16} />
              Change Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;