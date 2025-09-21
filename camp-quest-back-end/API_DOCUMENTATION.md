# CampQuest Backend API Documentation

## Overview
This is a comprehensive User Management API for CampQuest - a camping equipment rental and sales platform. The API includes advanced security features, email verification, password management, and role-based access control.

## Base URL
```
http://localhost:5001/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP
- Password reset: 3 requests per hour per IP
- Email verification: 5 requests per hour per IP

## User Roles
- `customer`: Regular users (default)
- `moderator`: Can moderate content
- `admin`: Full system access

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "address": {
    "street": "123 Camp St",
    "city": "Adventure City",
    "state": "CA",
    "zipCode": "90210",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isEmailVerified": false
    },
    "emailSent": true
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": "7d"
  }
}
```

### Verify Email
**GET** `/auth/verify-email/:token`

Verify user's email address using the token sent via email.

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Resend Email Verification
**POST** `/auth/resend-verification`

Resend email verification link.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset link.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### Reset Password
**PUT** `/auth/reset-password/:token`

Reset password using the token from email.

**Request Body:**
```json
{
  "password": "NewSecurePass123!"
}
```

### Get Profile
**GET** `/auth/profile`
*Requires Authentication*

Get current user's profile information.

### Update Profile
**PUT** `/auth/profile`
*Requires Authentication*

Update user profile information.

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567891",
  "address": {
    "street": "456 New St",
    "city": "New City",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

### Change Password
**PUT** `/auth/change-password`
*Requires Authentication*

Change user password.

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

### Upload Avatar
**POST** `/auth/upload-avatar`
*Requires Authentication*

Upload user profile picture.

**Form Data:**
- `avatar`: Image file (max 5MB, JPEG/PNG/GIF/WebP)

### Logout
**POST** `/auth/logout`
*Requires Authentication*

Logout from current device (blacklist current token).

### Logout All Devices
**POST** `/auth/logout-all`
*Requires Authentication*

Logout from all devices (invalidate all tokens).

---

## Admin Endpoints
*All admin endpoints require authentication and admin role*

### Get All Users
**GET** `/admin/users`

Get paginated list of all users with filtering options.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: Filter by role (customer, admin, moderator)
- `isActive`: Filter by active status (true/false)
- `isEmailVerified`: Filter by email verification (true/false)
- `search`: Search in name, email, phone
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 100,
      "hasNext": true,
      "hasPrev": false
    },
    "stats": {
      "totalUsers": 100,
      "activeUsers": 95,
      "verifiedUsers": 80,
      "adminUsers": 2,
      "customerUsers": 96,
      "moderatorUsers": 2
    }
  }
}
```

### Get User by ID
**GET** `/admin/users/:id`

Get detailed information about a specific user.

### Update User
**PUT** `/admin/users/:id`

Update user information (admin can modify any field).

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "moderator",
  "isActive": true,
  "isEmailVerified": true
}
```

### Delete User
**DELETE** `/admin/users/:id`

Soft delete user account (deactivate).

### Get User Activity
**GET** `/admin/users/:id/activity`

Get user's activity log.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

### Unlock User Account
**POST** `/admin/users/:id/unlock`

Unlock a user account that was locked due to failed login attempts.

### Force Logout User
**POST** `/admin/users/:id/force-logout`

Force logout user from all devices.

---

## Security Features

### Brute Force Protection
- Account lockout after 5 failed login attempts (2 hours)
- IP-based rate limiting (10 failed attempts = 30 min block)
- Progressive delays on failed attempts

### Password Security
- Minimum 8 characters with complexity requirements
- Password history check (prevents reuse of last 5 passwords)
- Secure password hashing with bcrypt (12 rounds)

### Session Management
- JWT tokens with configurable expiry
- Token blacklisting for secure logout
- Refresh token rotation
- "Remember Me" functionality (30 days vs 7 days)

### Email Security
- Email verification required for account activation
- Secure password reset with time-limited tokens
- Email notifications for security events

### Activity Logging
- Comprehensive activity tracking
- IP address and user agent logging
- Security event monitoring

---

## Error Responses

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### Account Locked (423)
```json
{
  "success": false,
  "message": "Account is temporarily locked. Try again in 45 minutes.",
  "lockTimeRemaining": 45
}
```

### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Environment Variables

See `.env.example` for all required environment variables including:
- Database connection
- JWT secrets
- Email service configuration
- Rate limiting settings
- Frontend URL for email links

---

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:5001` with automatic reload on file changes.
