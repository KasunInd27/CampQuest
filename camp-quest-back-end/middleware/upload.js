// middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create upload directories in frontend/public/uploads if they don't exist
const createUploadDirs = () => {
  const baseDir = path.join(process.cwd(), '../camp-quest-front-end/public/uploads');
  const dirs = [
    path.join(baseDir, 'sales-products'),
    path.join(baseDir, 'rental-products'),
    path.join(baseDir, 'blog-images') // Keep this for blog posts
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Call function to create directories
createUploadDirs();

// Storage configuration for sales products
const salesProductStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads/sales-products');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sales-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for rental products
const rentalProductStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads/rental-products');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'rental-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for blog images (if you want to keep it here)
const blogImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads/blog-images');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload configurations
export const uploadSalesProductImages = multer({
  storage: salesProductStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

export const uploadRentalProductImages = multer({
  storage: rentalProductStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

export const uploadBlogImages = multer({
  storage: blogImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Single file for blog posts
  }
});

// Helper function to delete file from frontend uploads
export const deleteImageFromFrontend = (imagePath, folder) => {
  try {
    const fullPath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads', folder, imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted image: ${fullPath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// Helper function to check if image exists in frontend uploads
export const imageExistsInFrontend = (imagePath, folder) => {
  try {
    const fullPath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads', folder, imagePath);
    return fs.existsSync(fullPath);
  } catch (error) {
    console.error('Error checking image existence:', error);
    return false;
  }
};