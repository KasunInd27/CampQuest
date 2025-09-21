# CampQuest Backend - Enhanced User Management System

A comprehensive Node.js/Express backend with advanced user management, authentication, and security features for the CampQuest camping equipment platform.

## 🚀 Features

### 🔐 Advanced Authentication & Security
- **JWT Authentication** with access & refresh tokens
- **Email Verification** with secure token-based system
- **Password Reset** via email with time-limited tokens
- **Brute Force Protection** with account lockout and IP blocking
- **Rate Limiting** on all endpoints with MongoDB storage
- **Session Management** with logout from all devices
- **Password Security** with history tracking and complexity requirements

### 👥 User Management
- **Role-Based Access Control** (Customer, Moderator, Admin)
- **User Registration** with email verification
- **Profile Management** with avatar upload
- **Activity Logging** for security monitoring
- **Account Lockout/Unlock** functionality
- **Admin Dashboard** capabilities

### 📧 Email System
- **Nodemailer Integration** with multiple provider support
- **Email Templates** for verification, password reset, notifications
- **Development Mode** with Ethereal Email for testing
- **Production Ready** with Gmail, SendGrid, Mailgun support

### 🛡️ Security Features
- **Password Hashing** with bcrypt (12 rounds)
- **Token Blacklisting** for secure logout
- **Input Validation** with comprehensive error handling
- **CORS Protection** and security headers
- **File Upload Security** with type and size validation

## 📁 Project Structure

```
src/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── adminController.js    # Admin user management
│   ├── productController.js  # Product management
│   ├── categoryController.js # Category management
│   └── orderController.js    # Order management
├── middleware/
│   ├── auth.js              # JWT authentication & authorization
│   ├── rateLimiter.js       # Rate limiting & brute force protection
│   └── upload.js            # File upload handling
├── models/
│   ├── User.js              # Enhanced user model
│   ├── TokenBlacklist.js    # Token blacklist for logout
│   ├── Product.js           # Product model
│   ├── Category.js          # Category model
│   └── Order.js             # Order model
├── routes/
│   ├── authRoutes.js        # Authentication endpoints
│   ├── adminRoutes.js       # Admin endpoints
│   ├── productRoutes.js     # Product endpoints
│   ├── categoryRoutes.js    # Category endpoints
│   └── orderRoutes.js       # Order endpoints
├── utils/
│   └── emailService.js      # Email service utilities
└── server.js                # Express server setup
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Email service account (Gmail, SendGrid, etc.)

### 1. Install Dependencies
```bash
cd camp-quest-back-end
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT Secrets (use strong, unique keys in production)
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@campquest.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5001`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions

### Admin Endpoints
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/:id/activity` - Get user activity
- `POST /api/admin/users/:id/unlock` - Unlock user account
- `POST /api/admin/users/:id/force-logout` - Force logout user

### Product & Category Endpoints
- Full CRUD operations for products and categories
- Image upload support
- Search and filtering capabilities
- Review system for products

### Order Management
- Create and manage rental/purchase orders
- Order status tracking
- Inventory management

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot reuse last 5 passwords

### Account Security
- Account lockout after 5 failed login attempts (2 hours)
- IP-based brute force protection (30 minutes after 10 failed attempts)
- Email verification required for account activation
- Activity logging for all security events

### Rate Limiting
- General API: 100 requests/15 minutes per IP
- Auth endpoints: 5 requests/15 minutes per IP
- Password reset: 3 requests/hour per IP
- Email verification: 5 requests/hour per IP

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phone": "+1234567890"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## 📧 Email Configuration

### Development (Ethereal Email)
For development, the system uses Ethereal Email for testing. Email preview URLs are logged to console.

### Production Email Services

#### Gmail
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

#### Mailgun
```env
EMAIL_SERVICE=mailgun
MAILGUN_USERNAME=your-mailgun-username
MAILGUN_PASSWORD=your-mailgun-password
```

## 🚀 Deployment

### Environment Variables for Production
- Use strong, unique JWT secrets
- Configure production email service
- Set `NODE_ENV=production`
- Use secure MongoDB connection with authentication
- Configure CORS for your frontend domain

### Recommended Production Setup
- Use PM2 for process management
- Set up SSL/TLS certificates
- Configure reverse proxy (nginx)
- Enable MongoDB authentication
- Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the error responses in the API docs
- Check server logs for detailed error information
- Ensure all environment variables are properly configured

## 🔄 Recent Updates

- ✅ Enhanced User model with security fields
- ✅ Implemented comprehensive authentication system
- ✅ Added email verification and password reset
- ✅ Implemented brute force protection
- ✅ Added admin user management
- ✅ Created token blacklist system
- ✅ Added rate limiting middleware
- ✅ Comprehensive API documentation
