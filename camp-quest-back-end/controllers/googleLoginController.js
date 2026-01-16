import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    const { token } = req.body;

    // ✅ 0) Validate request
    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        // 1️⃣ Verify token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // 2️⃣ Extract user info
        const payload = ticket.getPayload();
        const email = payload?.email;
        const name = payload?.name;
        const picture = payload?.picture;

        if (!email) {
            return res.status(401).json({ message: "Google token invalid" });
        }

        // 3️⃣ Check if user exists
        let user = await User.findOne({ email });

        // ✅ Optional: prevent mixing local + google on same email
        if (user && user.authProvider === "local") {
            return res.status(400).json({
                message: "This email is registered with password login. Please use email & password.",
            });
        }

        // 4️⃣ If not, create user
        if (!user) {
            user = await User.create({
                name: name || "User",
                email,
                avatar: picture || "",
                authProvider: "google",
            });
        }

        // 5️⃣ Create JWT
        const appToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 6️⃣ Send token + SAFE user object
        const safeUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider,
        };

        // Set cookie
        res.cookie('jwt', appToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.json({ token: appToken, user: safeUser });
    } catch (error) {
        console.error("Google login error:", error.message);
        return res.status(401).json({ message: "Google login failed" });
    }
};
