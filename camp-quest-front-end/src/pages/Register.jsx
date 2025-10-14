import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Mountain, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as Yup from 'yup';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register } = useAuth();

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .required('Name is required'),
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .max(100, 'Email must not exceed 100 characters')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password must not exceed 50 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
    terms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
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

    // Validate field if it has been touched
    if (touched[name]) {
      await validateField(name, value);
    }

    // Also validate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword && formData.confirmPassword) {
      try {
        await validationSchema.validateAt('confirmPassword', { 
          password: value, 
          confirmPassword: formData.confirmPassword 
        });
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: error.message
        }));
      }
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
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true
    });

    try {
      // Validate entire form
      const validationData = {
        ...formData,
        terms: agreedToTerms
      };
      
      await validationSchema.validate(validationData, { abortEarly: false });
      
      // Clear errors if validation passes
      setErrors({});
      
      // Proceed with registration
      setLoading(true);
      await register(formData.name, formData.email, formData.password);
    } catch (error) {
      if (error.inner) {
        // Yup validation errors
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        // Registration error
        console.error('Registration error:', error);
        setErrors({ submit: error.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    
    // Length check
    if (formData.password.length >= 8) strength++;
    if (formData.password.length >= 12) strength++;
    
    // Character variety checks
    if (formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/)) strength++;
    if (formData.password.match(/[0-9]/)) strength++;
    if (formData.password.match(/[^a-zA-Z0-9]/)) strength++;
    
    return Math.min(strength, 4);
  };

  const getPasswordStrengthText = () => {
    const strength = passwordStrength();
    switch(strength) {
      case 0: return 'Very weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-400';
    return 'bg-lime-500';
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
              Join CampGear
            </h2>
            <p className="text-neutral-600 text-sm">
              Create your account and start your outdoor adventure
            </p>
          </div>

          {/* Display general submit error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start">
              <div className="flex-shrink-0 mr-2 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </div>
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                focusedInput === 'name' ? 'text-lime-500' : errors.name && touched.name ? 'text-red-500' : 'text-neutral-400'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedInput('name')}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-3 border-2 ${
                  errors.name && touched.name 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                    : focusedInput === 'name' 
                      ? 'border-lime-500 bg-lime-50/30 focus:border-lime-500' 
                      : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 focus:border-lime-500'
                } rounded-lg text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20 transition-all duration-200`}
                placeholder="Enter your full name"
              />
              <label htmlFor="name" className={`absolute -top-2 left-8 px-1 bg-white text-xs font-semibold ${
                focusedInput === 'name' ? 'text-lime-500' : errors.name && touched.name ? 'text-red-500' : 'text-neutral-600'
              } transition-colors duration-200`}>
                Full Name
              </label>
              {errors.name && touched.name && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

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
                autoComplete="new-password"
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
                placeholder="Create a strong password"
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
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength()
                            ? getPasswordStrengthColor()
                            : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    passwordStrength() <= 1 ? 'text-red-500' : 
                    passwordStrength() === 2 ? 'text-yellow-600' : 
                    'text-lime-500'
                  }`}>
                    Password strength: {getPasswordStrengthText()}
                  </p>
                </div>
              )}
              
              {errors.password && touched.password && (
                <p className="mt-1 text-xs text-red-600 flex items-start">
                  <svg className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span>{errors.password}</span>
                </p>
              )}

              {/* Password Requirements Info */}
              {focusedInput === 'password' && !errors.password && (
                <div className="mt-2 p-3 bg-lime-50 border border-lime-200 rounded-lg">
                  <p className="text-xs text-lime-700 font-semibold mb-1">Password requirements:</p>
                  <ul className="text-xs space-y-0.5">
                    <li className={`flex items-center ${formData.password.length >= 8 ? 'text-lime-600' : 'text-neutral-500'}`}>
                      <CheckCircle className={`w-2.5 h-2.5 mr-1.5 ${formData.password.length >= 8 ? 'text-lime-500' : 'text-neutral-300'}`} />
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-lime-600' : 'text-neutral-500'}`}>
                      <CheckCircle className={`w-2.5 h-2.5 mr-1.5 ${/[A-Z]/.test(formData.password) ? 'text-lime-500' : 'text-neutral-300'}`} />
                      One uppercase letter
                    </li>
                    <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-lime-600' : 'text-neutral-500'}`}>
                      <CheckCircle className={`w-2.5 h-2.5 mr-1.5 ${/[a-z]/.test(formData.password) ? 'text-lime-500' : 'text-neutral-300'}`} />
                      One lowercase letter
                    </li>
                    <li className={`flex items-center ${/\d/.test(formData.password) ? 'text-lime-600' : 'text-neutral-500'}`}>
                      <CheckCircle className={`w-2.5 h-2.5 mr-1.5 ${/\d/.test(formData.password) ? 'text-lime-500' : 'text-neutral-300'}`} />
                      One number
                    </li>
                    <li className={`flex items-center ${/[@$!%*?&]/.test(formData.password) ? 'text-lime-600' : 'text-neutral-500'}`}>
                      <CheckCircle className={`w-2.5 h-2.5 mr-1.5 ${/[@$!%*?&]/.test(formData.password) ? 'text-lime-500' : 'text-neutral-300'}`} />
                      One special character (@$!%*?&)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                focusedInput === 'confirmPassword' ? 'text-lime-500' : errors.confirmPassword && touched.confirmPassword ? 'text-red-500' : 'text-neutral-400'
              }`}>
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-10 py-3 border-2 ${
                  errors.confirmPassword && touched.confirmPassword 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                    : focusedInput === 'confirmPassword' 
                      ? 'border-lime-500 bg-lime-50/30 focus:border-lime-500' 
                      : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 focus:border-lime-500'
                } rounded-lg text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20 transition-all duration-200`}
                placeholder="Confirm your password"
              />
              <label htmlFor="confirmPassword" className={`absolute -top-2 left-8 px-1 bg-white text-xs font-semibold ${
                focusedInput === 'confirmPassword' ? 'text-lime-500' : errors.confirmPassword && touched.confirmPassword ? 'text-red-500' : 'text-neutral-600'
              } transition-colors duration-200`}>
                Confirm Password
              </label>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
              {/* Password Match Indicator */}
              {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1 text-xs text-lime-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Passwords match perfectly
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="pt-1">
              <div className="flex items-start">
                <div className="relative">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (e.target.checked && errors.terms) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.terms;
                          return newErrors;
                        });
                      }
                    }}
                    className={`h-4 w-4 mt-0.5 ${
                      errors.terms && touched.terms ? 'border-red-500 text-red-500' : 'text-lime-500'
                    } focus:ring-lime-500 border-neutral-300 rounded transition-colors duration-200`}
                  />
                </div>
                <label htmlFor="terms" className="ml-2 block text-xs text-neutral-600 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-lime-500 hover:text-lime-500 font-semibold underline decoration-lime-500/30 hover:decoration-lime-500 transition-colors duration-200">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-lime-500 hover:text-lime-500 font-semibold underline decoration-lime-500/30 hover:decoration-lime-500 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && touched.terms && (
                <p className="mt-1 text-xs text-red-600 flex items-center ml-6">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.terms}
                </p>
              )}
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
                  Creating your account...
                </>
              ) : (
                <>
                  Join CampGear Community
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

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-lime-500 hover:text-lime-500 transition-colors duration-200">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;