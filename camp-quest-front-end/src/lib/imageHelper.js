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
    if (imgStr.startsWith('http') || imgStr.startsWith('data:')) return imgStr;
    const cleanFilename = imgStr.startsWith('/') ? imgStr.slice(1) : imgStr;
    return `${BASE_URL}/uploads/${folderName}/${cleanFilename}`;
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
