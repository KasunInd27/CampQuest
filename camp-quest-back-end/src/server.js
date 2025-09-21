import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import blogRoutes from './routes/blogRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Needed for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
// Development: allow all origins to simplify integration
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads correctly
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount blog routes
app.use('/api/blogs', blogRoutes);

// Basic routes
app.get('/', (req, res) => res.send("Hello, world!"));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong', error: err.message });
});

// Start server immediately so health endpoint is always available
app.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Connect DB asynchronously; API routes will work once connected
connectDB()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Failed to connect to DB:', err.message));

export default app;
