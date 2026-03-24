// utils/validationSchemas.js
import * as Yup from 'yup';

export const feedbackSchema = Yup.object({
  subject: Yup.string()
    .required('Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  category: Yup.string()
    .required('Category is required')
    .oneOf(['service', 'equipment', 'website', 'staff', 'pricing', 'suggestion']),
  rating: Yup.number()
    .required('Rating is required')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  message: Yup.string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  isAnonymous: Yup.boolean()
});

export const supportTicketSchema = Yup.object({
  subject: Yup.string()
    .required('Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  category: Yup.string()
    .required('Category is required')
    .oneOf(['technical', 'billing', 'equipment', 'general', 'complaint']),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['low', 'medium', 'high', 'urgent']),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters')
});