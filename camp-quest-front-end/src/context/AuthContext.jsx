// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Axios global config
axios.defaults.baseURL = "http://localhost:5000/api";
axios.defaults.withCredentials = true;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Check auth on app load
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔍 Check current auth session
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/auth/me");
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Email + Password login
  const login = async (email, password, rememberMe = false) => {
    try {
      const { data } = await axios.post("/auth/login", {
        email,
        password,
        rememberMe,
      });

      if (data?.success && data?.user) {
        setUser(data.user);

        // Optional: save JWT if backend returns it
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        toast.success("Login successful!");
        navigate(
          data.user.role === "admin"
            ? "/admin/dashboard"
            : "/dashboard"
        );

        return data;
      }

      throw new Error("Login failed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  // 🔵 GOOGLE LOGIN (IMPORTANT PART YOU ASKED FOR)
  const googleLogin = async (googleIdToken) => {
    try {
      const { data } = await axios.post("/auth/google", {
        token: googleIdToken,
      });

      // Backend returns: { token, user }
      if (data?.token && data?.user) {
        setUser(data.user);

        // Save JWT if you use it elsewhere
        localStorage.setItem("token", data.token);

        toast.success("Signed in with Google!");
        navigate(
          data.user.role === "admin"
            ? "/admin/dashboard"
            : "/dashboard"
        );

        return data;
      }

      throw new Error("Google login failed");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Google login failed"
      );
      throw error;
    }
  };

  // 📝 Register
  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post("/auth/register", {
        name,
        email,
        password,
      });

      if (data?.success && data?.user) {
        setUser(data.user);

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        toast.success("Registration successful!");
        navigate("/dashboard");

        return data;
      }

      throw new Error("Registration failed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      setUser(null);
      localStorage.removeItem("token");

      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const value = {
    user,
    loading,
    login,
    googleLogin, // ✅ exposed here
    register,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
