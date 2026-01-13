import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ 1️⃣ Get token from Authorization header (Google login / JWT)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // ✅ 2️⃣ Or from cookies (email/password login)
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    // ❌ No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // ✅ 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 4️⃣ decoded.id (NOT decoded.userId)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    // ✅ 5️⃣ Attach user to request
    req.user = user;
    next();
  } catch (error) {
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
