import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // DIAGNOSTIC LOGGING
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('REQUEST_PATH:', req.path);
    console.log('REQUEST_METHOD:', req.method);
    console.log('AUTH_HEADER:', req.headers.authorization);
    console.log('COOKIES:', req.cookies);

    // ✅ 1️⃣ Get token from Authorization header (Google login / JWT)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log('TOKEN_FROM_HEADER:', token ? token.substring(0, 20) + '...' : 'NONE');
    }
    // ✅ 2️⃣ Or from cookies (email/password login)
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
      console.log('TOKEN_FROM_COOKIE:', token ? token.substring(0, 20) + '...' : 'NONE');
    }

    // ❌ No token found
    if (!token) {
      console.log('AUTH_RESULT: NO TOKEN - 401');
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // ✅ 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('TOKEN_DECODED:', decoded);

    // ✅ 4️⃣ decoded.id (NOT decoded.userId)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log('AUTH_RESULT: USER NOT FOUND - 401');
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    console.log('AUTH_RESULT: SUCCESS - User:', user.email, 'Role:', user.role);

    // ✅ 5️⃣ Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.log('AUTH_RESULT: TOKEN VERIFICATION FAILED - 401');
    console.error('AUTH_ERROR:', error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
};
