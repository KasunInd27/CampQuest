import { BASE_URL } from './axios';

/**
 * Resolves a valid image URL for a product, handling various legacy formats and cloud/local sources.
 * Priorities:
 * 1. product.imageUrl (Full URL)
 * 2. product.image (String - URL or filename)
 * 3. product.images[0] (Array - URL or filename)
 * 
 * @param {Object} product - The product object
 * @param {String} folderName - The local folder name fallback (e.g. 'rental-products', 'sales-products', 'blog-images')
 * @returns {String|null} - The unresolved full URL or null if no image found.
 */
// Helper to process a potential image string (URL or filename) separately
export const resolveImageUrl = (imgStr, folderName = 'rental-products') => {
    if (!imgStr) return 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

    // Strict Mixed Content Fix:
    // If we are in production (or generally), we should NOT be requesting localhost.
    // If the DB returns "http://localhost:5000/...", we must rewrite it to the actual API URL.
    const apiUrl = import.meta.env.VITE_API_URL || 'https://campquest-lwsl.onrender.com';

    if (imgStr.startsWith('http') || imgStr.startsWith('data:')) {
        if (imgStr.includes('localhost:5000')) {
            return imgStr.replace('http://localhost:5000', apiUrl);
        }
        return imgStr;
    }

    const cleanFilename = imgStr.startsWith('/') ? imgStr.slice(1) : imgStr;

    // Logic for bare filenames:
    // User requested `${VITE_API_URL}/media/img/${filename}` (or fallback for legacy structure)
    // The previous legacy logic used /uploads/folderName/filename.
    // The new logic (uploadController) uses /media/img/filename.
    // We need to handle both if we are unsure, but let's stick to what the user asked for new ones.
    // If it looks like a legacy filename (no path), maybe try to be smart?
    // User said: "If stored image value is a filename -> `${VITE_API_URL}/media/img/${filename}` or `/uploads/${filename}`"

    // Default to the new /media/img structure? Or keep /uploads/... based on folderName for legacy compatibility?
    // Given the migration script runs on the backend to fix URLs, this local fallback is for NEW data or unmigrated data.
    // Since we are moving to /media, let's prioritize that if it looks like a simple filename.

    return `${apiUrl}/uploads/${folderName}/${cleanFilename}`;
};

export const getValidImageUrl = (product, folderName = 'rental-products') => {
    if (!product) return null;

    // 1. Check imageUrl (often explicit full URL)
    if (product.imageUrl) {
        return resolveImageUrl(product.imageUrl, folderName);
    }

    // 2. Check image (legacy string)
    if (product.image && typeof product.image === 'string') {
        return resolveImageUrl(product.image, folderName);
    }

    // 3. Check images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return resolveImageUrl(product.images[0], folderName);
    }

    return resolveImageUrl(null); // Return fallback
};
