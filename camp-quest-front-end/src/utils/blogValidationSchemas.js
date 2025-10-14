// utils/blogValidationSchemas.js
import * as Yup from 'yup';

const blogCategories = [
  'gear reviews',
  'camping tips', 
  'camping recipes',
  'destinations & locations',
  'beginner guides'
];

export const blogPostSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .required('Title is required'),
  author: Yup.string()
    .min(2, 'Author name must be at least 2 characters')
    .max(100, 'Author name must not exceed 100 characters')
    .required('Author is required'),
  content: Yup.string()
    .min(100, 'Content must be at least 100 characters')
    .required('Content is required'),
  category: Yup.string()
    .oneOf(blogCategories, 'Please select a valid category')
    .required('Category is required'),
  publishedDate: Yup.date()
    .required('Published date is required'),
  status: Yup.string()
    .oneOf(['draft', 'published'], 'Invalid status')
    .required('Status is required'),
  image: Yup.mixed()
    .required('Image is required')
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return false;
      return value && ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(value.type);
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return false;
      return value && value.size <= 5 * 1024 * 1024;
    })
});

export const blogPostUpdateSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .required('Title is required'),
  author: Yup.string()
    .min(2, 'Author name must be at least 2 characters')
    .max(100, 'Author name must not exceed 100 characters')
    .required('Author is required'),
  content: Yup.string()
    .min(100, 'Content must be at least 100 characters')
    .required('Content is required'),
  category: Yup.string()
    .oneOf(blogCategories, 'Please select a valid category')
    .required('Category is required'),
  publishedDate: Yup.date()
    .required('Published date is required'),
  status: Yup.string()
    .oneOf(['draft', 'published'], 'Invalid status')
    .required('Status is required'),
  image: Yup.mixed()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true; // Image is optional for updates
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(value.type);
    })
    .test('fileSize', 'File size must be less than 5MB', (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
});

export { blogCategories };