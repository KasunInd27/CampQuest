// utils/checkoutValidations.js
import * as yup from 'yup';

// Matches 0712345678 or +94712345678
const phoneRegex = /^(?:\+94|0)7[0-9]{8}$/;

export const checkoutValidationSchema = yup.object({
  // Personal Information
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),

  phone: yup
    .string()
    .required('Phone number is required')
    .matches(phoneRegex, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),

  // Delivery Information
  address: yup
    .string()
    .when('$hasSaleItems', {
      is: true,
      then: (schema) => schema
        .required('Street address is required')
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address must be less than 200 characters'),
      otherwise: (schema) => schema.nullable()
    }),

  city: yup
    .string()
    .when('$hasSaleItems', {
      is: true,
      then: (schema) => schema
        .required('City is required')
        .min(2, 'City must be at least 2 characters')
        .max(50, 'City must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
      otherwise: (schema) => schema.nullable()
    }),

  state: yup
    .string()
    .when('$hasSaleItems', {
      is: true,
      then: (schema) => schema
        .required('State is required')
        .min(2, 'State must be at least 2 characters')
        .max(50, 'State must be less than 50 characters')
        .matches(/^[a-zA-Z\s]+$/, 'State can only contain letters and spaces'),
      otherwise: (schema) => schema.nullable()
    }),

  zipCode: yup
    .string()
    .when('$hasSaleItems', {
      is: true,
      then: (schema) => schema
        .required('ZIP code is required')
        .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'),
      otherwise: (schema) => schema.nullable()
    }),

  country: yup
    .string()
    .max(50, 'Country must be less than 50 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Country can only contain letters and spaces'),

  // Rental Dates (conditional)
  startDate: yup
    .date()
    .nullable()
    .when('$hasRentalItems', {
      is: true,
      then: (schema) => schema
        .required('Start date is required for rental orders')
        .min(new Date().setHours(0, 0, 0, 0), 'Start date cannot be in the past'),
      otherwise: (schema) => schema.nullable()
    }),

  endDate: yup
    .date()
    .nullable()
    .when(['$hasRentalItems', 'startDate'], {
      is: (hasRentalItems, startDate) => hasRentalItems && startDate,
      then: (schema) => schema
        .required('End date is required for rental orders')
        .min(yup.ref('startDate'), 'End date must be after start date')
        .test('min-rental-period', 'Minimum rental period is 1 day', function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true;
          const diffTime = new Date(value) - new Date(startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 1;
        })
        .test('max-rental-period', 'Maximum rental period is 365 days', function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true;
          const diffTime = new Date(value) - new Date(startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 365;
        }),
      otherwise: (schema) => schema.nullable()
    }),

  // Additional Notes
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters')
});