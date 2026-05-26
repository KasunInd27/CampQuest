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
        const email_verified = payload?.email_verified;
        const googleId = payload?.sub;

        if (!email) {
            return res.status(401).json({ message: "Google token invalid: email missing" });
        }
        if (!googleId) {
            return res.status(401).json({ message: "Google token invalid: sub identifier missing" });
        }

        // ✅ Security: Ensure email is verified in Google to prevent hijacking
        if (!email_verified) {
            return res.status(400).json({ message: "Google account email is not verified" });
        }

        // 3️⃣ Search by googleId (preferred index search)
        let user = await User.findOne({ googleId });

        if (!user) {
            // Search by email to see if they registered via password or another provider
            user = await User.findOne({ email });

            if (user) {
                // Scenario A / Lazy Migration: Email matches but googleId is not linked yet.
                // We link the Google account to the existing user.
                user.googleId = googleId;

                // Sync profile avatar if not set
                if (!user.avatar && picture) {
                    user.avatar = picture;
                }

                await user.save();
            }
        } else {
            // User found by googleId. Keep profile info synced if updated.
            let updated = false;
            if (picture && user.avatar !== picture) {
                user.avatar = picture;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        }

        // 4️⃣ If neither search matched, create new user (Scenario C)
        if (!user) {
            user = await User.create({
                name: name || "User",
                email,
                avatar: picture || "",
                googleId,
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
        res.cookie("jwt", appToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ token: appToken, user: safeUser });
    } catch (error) {
        console.error("Google login error:", error.message);
        return res.status(401).json({ message: "Google login failed" });
    }
};
