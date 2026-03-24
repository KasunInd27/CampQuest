import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

console.log("Current working directory:", process.cwd());
console.log("Mongo URI available:", !!process.env.MONGODB_URI);
if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not found. Please ensure .env exists in the root.");
    // Try explicit path as fallback
    const envPath = path.resolve(process.cwd(), '.env');
    console.log("Trying explicit path:", envPath);
    dotenv.config({ path: envPath });
    console.log("Mongo URI available after retry:", !!process.env.MONGODB_URI);
}

const createAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminEmail = 'campquest512@gmail.com';
        const adminPassword = 'camp_quest@512'; // Change this!

        // Check if admin exists
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists. Updating...');
            userExists.password = adminPassword;
            userExists.role = 'admin';
            userExists.authProvider = 'local';
            await userExists.save();
            console.log('Admin user updated successfully');
        } else {
            console.log('Creating new admin user...');
            await User.create({
                name: 'CampQuest Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                authProvider: 'local'
            });
            console.log('Admin user created successfully');
        }

        console.log('-----------------------------------');
        console.log('Login Credentials:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
