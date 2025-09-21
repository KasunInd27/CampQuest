// routes/UserManagement/User.js  (ESM)

import express from "express";
import { verifyToken } from "../../middleware/UserManagement/verifyToken.js";
import {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  logout,
  login,
  verifyEmail,
  forgetPassword,
  verifyOTPAndResetPassword,
  checkAuth,
} from "../../controllers/UserManagement/UserController.js";

const router = express.Router();

// optional sanity check
console.log("verifyToken:", typeof verifyToken, "checkAuth:", typeof checkAuth);

router.get("/check-auth", verifyToken, checkAuth);
router.post("/addUser", addUser);
router.post("/register", addUser); // Frontend compatibility
router.get("/AllUser", getAllUsers);
router.get("/SelectUser/:id", getUserById);
router.put("/updateUser/:id", updateUser);
router.delete("/deleteUser/:id", deleteUser);
router.post("/logout", logout);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgetPassword); // Frontend compatibility
router.post("/forget-password", forgetPassword);
router.post("/verify-otp-reset-password", verifyOTPAndResetPassword);

export default router;
