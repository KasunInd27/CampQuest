import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureUploadDirs = () => {
    const dirs = ['uploads/products', 'uploads/users', 'uploads/categories'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

ensureUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        
        // Determine upload path based on field name or route
        if (file.fieldname === 'productImages' || req.baseUrl.includes('products')) {
            uploadPath += 'products/';
        } else if (file.fieldname === 'avatar' || req.baseUrl.includes('users')) {
            uploadPath += 'users/';
        } else if (file.fieldname === 'categoryImage' || req.baseUrl.includes('categories')) {
            uploadPath += 'categories/';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        cb(null, filename);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files
    },
    fileFilter: fileFilter
});

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 10 files allowed.'
            });
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name for file upload.'
            });
        }
    } else if (error.message.includes('Only image files')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

// Export different upload configurations
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

// Utility function to delete uploaded files
export const deleteUploadedFiles = (files) => {
    if (!files) return;
    
    const filesToDelete = Array.isArray(files) ? files : [files];
    
    filesToDelete.forEach(file => {
        if (file && file.path) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
    });
};

export default upload;
