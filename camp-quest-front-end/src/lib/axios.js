import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
export const BASE_URL = API_URL;

const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
});

// Request interceptor to attach token from localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauthorized errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized request, clearing local session...");
            localStorage.removeItem("token");
            // Optional: window.location.href = "/login"; 
            // Better to handle this via Context if possible
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
