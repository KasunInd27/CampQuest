import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // Ensure media/img directory exists
        const uploadDir = path.join(__dirname, '../media/img');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate safe filename (no 'rental', 'ad', etc.)
        const ext = req.file.mimetype.split('/')[1] || 'jpg';
        const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Write buffer to disk
        fs.writeFileSync(filepath, req.file.buffer);

        // Construct full URL
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const fileUrl = `${baseUrl}/media/img/${filename}`;

        return res.json({
            success: true,
            url: fileUrl
        });
    } catch (err) {
        console.error("Local upload error:", err);
        return res.status(500).json({ message: "Image upload failed" });
    }
};
