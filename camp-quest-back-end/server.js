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
import categoryRoutes from './routes/categoryRoutes.js'
import RentalProductRoutes from './routes/rentalProductRoutes.js'
import SalesProductRoutes from './routes/salesProductRoutes.js'
import OrderRoutes from './routes/orderRoutes.js'
import BlogPostRoutes from './routes/blogPostRoutes.js'
import DashboardRoutes from './routes/dashboardRoutes.js'
import blogInteractionRoutes from './routes/blogInteractionRoutes.js';
import googleLoginRoutes from './routes/googleLoginRoutes.js';


dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/categories', categoryRoutes)
app.use('/api/rental-products', RentalProductRoutes)
app.use('/api/sales-products', SalesProductRoutes)
app.use('/api/orders', OrderRoutes)
app.use('/api/blog-posts', BlogPostRoutes)
app.use('/api/dashboard', DashboardRoutes)
app.use('/api/blog-interactions', blogInteractionRoutes);
app.use('/api/auth/google', googleLoginRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });