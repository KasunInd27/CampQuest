import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import BlogController from '../controllers/blogController.js';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '..', 'public', 'uploads');
    try { fs.mkdirSync(dest, { recursive: true }); } catch {}
    cb(null, dest);
  },
  filename: (req, file, cb) => cb(null, 'blog-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const valid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    valid ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

// Routes
router.get('/', BlogController.getAllBlogs);
router.get('/stats', BlogController.getBlogStats);
router.get('/seed', BlogController.seedBlogs);
router.get('/:id', BlogController.getBlogById);
router.post('/', upload.single('featuredImage'), BlogController.createBlog);
router.put('/:id', upload.single('featuredImage'), BlogController.updateBlog);
router.delete('/:id', BlogController.deleteBlog);
router.post('/:id/react', BlogController.reactToBlog);

export default router;
