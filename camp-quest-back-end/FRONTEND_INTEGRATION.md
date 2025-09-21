# Frontend Integration Guide - CampQuest API

## Base Configuration

```javascript
// config/api.js
const API_BASE_URL = 'http://localhost:5002/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to make authenticated requests
const makeRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        // Handle token expiration
        if (response.status === 401 && data.message?.includes('expired')) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            return;
        }
        
        return { data, status: response.status, ok: response.ok };
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};
```

## Authentication Functions

```javascript
// services/auth.js

// Register new user
export const registerUser = async (userData) => {
    const response = await makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    
    if (response.ok) {
        // Optional: Auto-login after registration
        // localStorage.setItem('authToken', response.data.data.token);
        return response.data;
    }
    throw new Error(response.data.message);
};

// Login user
export const loginUser = async (email, password, rememberMe = false) => {
    const response = await makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe })
    });
    
    if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data;
    }
    throw new Error(response.data.message);
};

// Logout user
export const logoutUser = async () => {
    try {
        await makeRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage regardless
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

// Get user profile
export const getUserProfile = async () => {
    const response = await makeRequest('/auth/profile');
    
    if (response.ok) {
        return response.data.data.user;
    }
    throw new Error(response.data.message);
};

// Update user profile
export const updateUserProfile = async (profileData) => {
    const response = await makeRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
    
    if (response.ok) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data;
    }
    throw new Error(response.data.message);
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
    const response = await makeRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (response.ok) {
        return response.data;
    }
    throw new Error(response.data.message);
};

// Forgot password
export const forgotPassword = async (email) => {
    const response = await makeRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
    });
    
    if (response.ok) {
        return response.data;
    }
    throw new Error(response.data.message);
};
```

## React Integration Example

```jsx
// hooks/useAuth.js (React Hook)
import { useState, useEffect, createContext, useContext } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password, rememberMe) => {
        try {
            setLoading(true);
            const response = await authService.loginUser(email, password, rememberMe);
            setUser(response.data.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await authService.registerUser(userData);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logoutUser();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await authService.updateUserProfile(profileData);
            setUser(response.data.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            login,
            register,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
```

## React Component Examples

```jsx
// components/LoginForm.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password, formData.rememberMe);
            // Redirect to dashboard or home page
            window.location.href = '/dashboard';
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                />
            </div>
            <div>
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                />
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                    />
                    Remember Me
                </label>
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default LoginForm;
```

```jsx
// components/RegisterForm.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await register(formData);
            setSuccess('Registration successful! Please check your email to verify your account.');
            // Optionally redirect to login page
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
            />
            <input
                type="password"
                placeholder="Password (min 8 chars, must include uppercase, lowercase, number, special char)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
            />
            <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
            />
            
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

export default RegisterForm;
```

## Protected Route Component

```jsx
// components/ProtectedRoute.jsx
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = '/login';
        return null;
    }

    // Check if email is verified for certain routes
    if (!user?.isEmailVerified) {
        return (
            <div>
                <h2>Email Verification Required</h2>
                <p>Please verify your email address to access this page.</p>
                <button onClick={() => window.location.href = '/verify-email'}>
                    Resend Verification Email
                </button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
```

## Error Handling

```javascript
// utils/errorHandler.js
export const handleApiError = (error, setError) => {
    if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'An error occurred';
        setError(message);
        
        // Handle specific error codes
        switch (error.response.status) {
            case 401:
                // Unauthorized - redirect to login
                localStorage.removeItem('authToken');
                window.location.href = '/login';
                break;
            case 403:
                // Forbidden - show access denied message
                setError('Access denied. You do not have permission to perform this action.');
                break;
            case 429:
                // Rate limited
                setError('Too many requests. Please try again later.');
                break;
            default:
                setError(message);
        }
    } else if (error.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
    } else {
        // Other error
        setError(error.message || 'An unexpected error occurred');
    }
};
```

## Usage in Your App

```jsx
// App.jsx
import { AuthProvider } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <div className="App">
                {/* Your routing logic here */}
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;
```

## Environment Configuration

```javascript
// .env (Frontend)
REACT_APP_API_BASE_URL=http://localhost:5002/api
REACT_APP_API_TIMEOUT=10000
```

```javascript
// config/api.js (Updated)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';
const API_TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 10000;
```

## Testing Your Integration

```javascript
// Test the connection
const testConnection = async () => {
    try {
        const response = await fetch('http://localhost:5002/');
        const text = await response.text();
        console.log('API Status:', text); // Should show "API is running..."
    } catch (error) {
        console.error('API connection failed:', error);
    }
};

testConnection();
```

This integration guide provides everything you need to connect your frontend to the CampQuest backend API with proper authentication, error handling, and state management!
