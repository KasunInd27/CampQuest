import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // Create a buffer stream from the uploaded file buffer
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);

        // Upload to Cloudinary using upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'campquest', // Optional: Organize uploads in a folder
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ message: "Image upload failed: " + error.message });
                }

                return res.json({
                    success: true,
                    url: result.secure_url
                });
            }
        );

        // Pipe the buffer stream to the upload stream
        bufferStream.pipe(uploadStream);

    } catch (err) {
        console.error("Upload controller error:", err);
        return res.status(500).json({ message: "Image upload processing failed" });
    }
};
