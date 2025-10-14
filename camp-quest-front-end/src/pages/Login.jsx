import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Mountain, CheckCircle, AlertCircle, Tent } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as Yup from 'yup';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .max(100, 'Email must not exceed 100 characters')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must not exceed 50 characters')
      .required('Password is required')
  });

  const validateField = async (fieldName, value) => {
    try {
      await validationSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }

    // Validate field if it has been touched
    if (touched[name]) {
      await validateField(name, value);
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    setFocusedInput('');
    await validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });

    try {
      // Validate entire form
      await validationSchema.validate(formData, { abortEarly: false });
      
      // Clear errors if validation passes
      setErrors({});
      
      // Proceed with login
      setLoading(true);
      await login(formData.email, formData.password, rememberMe);
    } catch (error) {
      if (error.inner) {
        // Yup validation errors
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        // Login error from API
        console.error('Login error:', error);
        setErrors({ 
          general: error.response?.data?.message || 'Invalid email or password. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center text-lime-500 group">
            <div className="p-2 bg-lime-500/10 rounded-xl mr-3 group-hover:bg-lime-500/20 transition-all duration-300">
              <Mountain className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold block">CampGear</span>
              <span className="text-lime-500/80 text-xs">Smart Camping Solutions</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Welcome back, Camper!
            </h2>
            <p className="text-neutral-600 text-sm">
              Sign in to access your camping gear dashboard
            </p>
          </div>

          {/* Display general error (e.g., invalid credentials) */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-800">{errors.general}</p>
                <p className="text-xs text-red-600 mt-1">
                  Please check your credentials and try again.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                focusedInput === 'email' ? 'text-lime-500' : errors.email && touched.email ? 'text-red-500' : 'text-neutral-400'
              }`}>
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedInput('email')}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-3 border-2 ${
                  errors.email && touched.email 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                    : focusedInput === 'email' 
                      ? 'border-lime-500 bg-lime-50/30 focus:border-lime-500' 
                      : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 focus:border-lime-500'
                } rounded-lg text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20 transition-all duration-200`}
                placeholder="Enter your email address"
              />
              <label htmlFor="email" className={`absolute -top-2 left-8 px-1 bg-white text-xs font-semibold ${
                focusedInput === 'email' ? 'text-lime-500' : errors.email && touched.email ? 'text-red-500' : 'text-neutral-600'
              } transition-colors duration-200`}>
                Email Address
              </label>
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.email}
                </p>
              )}
              {/* Email format hint */}
              {focusedInput === 'email' && !errors.email && formData.email && (
                <p className="mt-1 text-xs text-neutral-500 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-lime-500" />
                  Email format looks good
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                focusedInput === 'password' ? 'text-lime-500' : errors.password && touched.password ? 'text-red-500' : 'text-neutral-400'
              }`}>
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-10 py-3 border-2 ${
                  errors.password && touched.password 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                    : focusedInput === 'password' 
                      ? 'border-lime-500 bg-lime-50/30 focus:border-lime-500' 
                      : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 focus:border-lime-500'
                } rounded-lg text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20 transition-all duration-200`}
                placeholder="Enter your password"
              />
              <label htmlFor="password" className={`absolute -top-2 left-8 px-1 bg-white text-xs font-semibold ${
                focusedInput === 'password' ? 'text-lime-500' : errors.password && touched.password ? 'text-red-500' : 'text-neutral-600'
              } transition-colors duration-200`}>
                Password
              </label>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.password && touched.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-neutral-300 rounded transition-colors duration-200"
                  />
                </div>
                <span className="ml-2 text-xs text-neutral-600 group-hover:text-neutral-800 transition-colors duration-200">
                  Remember me for 30 days
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-lime-500 hover:text-lime-500 font-semibold transition-colors duration-200 hover:underline decoration-lime-500/30"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-neutral-900 bg-lime-500 hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing you in...
                </>
              ) : (
                <>
                  Access Your Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-neutral-500 font-medium">Or continue with</span>
              </div>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600 text-xs">
              New to CampGear?{' '}
              <Link to="/register" className="font-semibold text-lime-500 hover:text-lime-500 transition-colors duration-200">
                Join our community →
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-neutral-400 text-xs">
            <div className="flex items-center space-x-1">
              <Tent className="w-3 h-3" />
              <span>Trusted by 5K+ Campers</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Secure & Reliable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;