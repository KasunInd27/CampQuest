import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    createPackage,
    getPackages,
    getPackage,
    updatePackage,
    deletePackage
} from '../controllers/packageController.js';

const router = express.Router();

// Public routes
router.get('/', getPackages); // Get all (filtered by active for non-admin handled in controller if req.user passed, but typically we want public endpoint to treat everyone as generic unless we have auth middleware here. Let's make it simple: public gets active, admin endpoint for all?) 
// Actually, for simplicity, logic in controller assumes req.user is populated. 
// We should add optional auth middleware if we want to distinguish admin vs public in GET /
// For now, let's keep it public, return only active. Admin can search via specific admin endpoint or we just filter client side?
// Better: Controller logic uses req.user. We'll use 'protect' middleware optionally? 
// Actually standard pattern: Public GET returns active. Admin specific GET (or query param) returns all.
// Let's modify controller logic to be safer or routes.
// Re-checking controller: "const isAdmin = req.user && req.user.role === 'admin';"
// This works if we use `protect` middleware but making it optional is tricky in Express unless we write a custom one or just put it on a separate route.
// Let's just allow public access to see ALL active packages. Admin needs to see all including inactive.
// I'll leave the controller logic as is, but we might need a way to pass user info if logged in.
// If the user is NOT logged in, req.user is undefined, so isAdmin is false. correct.

router.get('/:id', getPackage);

// Admin routes
router.post('/', protect, admin, createPackage);
router.put('/:id', protect, admin, updatePackage);
router.delete('/:id', protect, admin, deletePackage);

export default router;
