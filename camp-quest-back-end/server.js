import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/AuthRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import adminRoutes from './routes/AdminRoutes.js';
import feedbackRoutes from './routes/feedback.js';
import supportTicketRoutes from './routes/supportTickets.js';
import categoryRoutes from './routes/categoryRoutes.js';
import RentalProductRoutes from './routes/rentalProductRoutes.js';
import SalesProductRoutes from './routes/salesProductRoutes.js';
import OrderRoutes from './routes/orderRoutes.js';
import BlogPostRoutes from './routes/blogPostRoutes.js';
import DashboardRoutes from './routes/dashboardRoutes.js';
import blogInteractionRoutes from './routes/blogInteractionRoutes.js';
import googleLoginRoutes from './routes/googleLoginRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";
import packageRoutes from './routes/packageRoutes.js';


import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// ✅ IMPORTANT for Render/Railway/behind-proxy (required for secure cookies)
app.set('trust proxy', 1);

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS (works for localhost + production)
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

// ✅ Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/media', express.static(path.join(__dirname, 'media')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/rental-products', RentalProductRoutes);
app.use('/api/sales-products', SalesProductRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api/blog-posts', BlogPostRoutes);
app.use('/api/dashboard', DashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/blog-interactions', blogInteractionRoutes);
app.use('/api/auth/google', googleLoginRoutes);
app.use("/api/uploads", uploadRoutes);
app.use('/api/packages', packageRoutes);


// ✅ Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

// ✅ MongoDB connection + server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
