import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // Convert buffer to base64 for Cloudinary
        const b64 = req.file.buffer.toString("base64");
        const dataUri = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "campquest/products", // you can change folder name
        });

        return res.json({
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ message: "Image upload failed" });
    }
};
