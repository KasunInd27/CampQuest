import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SalesProduct from '../models/SalesProduct.js';
import RentalProduct from '../models/RentalProduct.js';

dotenv.config();

const migrateImages = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const PROD_URL = 'https://campquest-lwsl.onrender.com';
        const LOCAL_URL = 'http://localhost:5000';

        // 1. Update Sales Products
        const salesProducts = await SalesProduct.find({
            $or: [
                { image: { $regex: LOCAL_URL } },
                { imageUrl: { $regex: LOCAL_URL } },
                { images: { $elemMatch: { $regex: LOCAL_URL } } }
            ]
        });

        console.log(`Found ${salesProducts.length} SalesProducts to update.`);

        for (const p of salesProducts) {
            let modified = false;

            // Fix legacy image field
            if (p.image && p.image.includes(LOCAL_URL)) {
                p.image = p.image.replace(LOCAL_URL, PROD_URL);
                modified = true;
            }

            // Fix legacy imageUrl field
            if (p.imageUrl && p.imageUrl.includes(LOCAL_URL)) {
                p.imageUrl = p.imageUrl.replace(LOCAL_URL, PROD_URL);
                modified = true;
            }

            // Fix images array
            if (p.images && p.images.length > 0) {
                const newImages = p.images.map(img => {
                    if (img && img.includes(LOCAL_URL)) {
                        modified = true;
                        return img.replace(LOCAL_URL, PROD_URL);
                    }
                    return img;
                });
                p.images = newImages;
            }

            if (modified) {
                await p.save();
                console.log(`Updated SalesProduct: ${p.name}`);
            }
        }

        // 2. Update Rental Products
        const rentalProducts = await RentalProduct.find({
            $or: [
                { image: { $regex: LOCAL_URL } },
                { imageUrl: { $regex: LOCAL_URL } },
                { images: { $elemMatch: { $regex: LOCAL_URL } } }
            ]
        });

        console.log(`Found ${rentalProducts.length} RentalProducts to update.`);

        for (const p of rentalProducts) {
            let modified = false;

            // Fix legacy image field
            if (p.image && p.image.includes(LOCAL_URL)) {
                p.image = p.image.replace(LOCAL_URL, PROD_URL);
                modified = true;
            }

            // Fix legacy imageUrl field
            if (p.imageUrl && p.imageUrl.includes(LOCAL_URL)) {
                p.imageUrl = p.imageUrl.replace(LOCAL_URL, PROD_URL);
                modified = true;
            }

            // Fix images array
            if (p.images && p.images.length > 0) {
                const newImages = p.images.map(img => {
                    if (img && img.includes(LOCAL_URL)) {
                        modified = true;
                        return img.replace(LOCAL_URL, PROD_URL);
                    }
                    return img;
                });
                p.images = newImages;
            }

            if (modified) {
                await p.save();
                console.log(`Updated RentalProduct: ${p.name}`);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateImages();
