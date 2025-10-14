// utils/productValidations.js
import * as yup from 'yup';

export const rentalProductValidationSchema = yup.object({
  name: yup
    .string()
    .required('Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters'),
  
  description: yup
    .string()
    .max(1000, 'Description must be less than 1000 characters'),
  
  dailyRate: yup
    .number()
    .required('Daily rate is required')
    .positive('Daily rate must be a positive number')
    .min(0.01, 'Daily rate must be at least 0.01'),
  
  weeklyRate: yup
    .number()
    .nullable()
    .positive('Weekly rate must be a positive number')
    .test('weekly-rate-check', 'Weekly rate should be less than 7 times daily rate', function(value) {
      const { dailyRate } = this.parent;
      if (value && dailyRate) {
        return value <= dailyRate * 7;
      }
      return true;
    }),
  
  monthlyRate: yup
    .number()
    .nullable()
    .positive('Monthly rate must be a positive number')
    .test('monthly-rate-check', 'Monthly rate should be less than 30 times daily rate', function(value) {
      const { dailyRate } = this.parent;
      if (value && dailyRate) {
        return value <= dailyRate * 30;
      }
      return true;
    }),
  
  securityDeposit: yup
    .number()
    .nullable()
    .min(0, 'Security deposit cannot be negative'),
  
  category: yup
    .string()
    .required('Category is required'),
  
  brand: yup
    .string()
    .max(50, 'Brand name must be less than 50 characters'),
  
  quantity: yup
    .number()
    .required('Quantity is required')
    .integer('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  
  features: yup
    .string()
    .max(2000, 'Features must be less than 2000 characters'),
  
  specifications: yup
    .string()
    .max(2000, 'Specifications must be less than 2000 characters'),
  
  condition: yup
    .string()
    .required('Condition is required')
    .oneOf(['excellent', 'good', 'fair', 'needs-repair'], 'Invalid condition'),
  
  availabilityStatus: yup
    .string()
    .required('Availability status is required')
    .oneOf(['available', 'rented', 'maintenance', 'unavailable'], 'Invalid availability status'),
  
  isActive: yup
    .boolean()
    .required('Active status is required')
});

export const salesProductValidationSchema = yup.object({
  name: yup
    .string()
    .required('Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters'),
  
  description: yup
    .string()
    .max(1000, 'Description must be less than 1000 characters'),
  
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be a positive number')
    .min(0.01, 'Price must be at least 0.01'),
  
  category: yup
    .string()
    .required('Category is required'),
  
  brand: yup
    .string()
    .max(50, 'Brand name must be less than 50 characters'),
  
  stock: yup
    .number()
    .required('Stock is required')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  
  features: yup
    .string()
    .max(2000, 'Features must be less than 2000 characters'),
  
  specifications: yup
    .string()
    .max(2000, 'Specifications must be less than 2000 characters'),
  
  isActive: yup
    .boolean()
    .required('Active status is required')
});