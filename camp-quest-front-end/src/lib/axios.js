import axios from "axios";

// ✅ Base URL (NO /api here)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ EXPORT THIS (🔥 FIX)
export const BASE_URL = API_URL;

// ✅ Axios instance
const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
});

// ✅ Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;