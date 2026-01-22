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
export const getValidImageUrl = (product, folderName = 'rental-products') => {
    if (!product) return null;

    // Helper to process a potential image string (URL or filename)
    const processImageString = (imgStr) => {
        if (!imgStr) return null;
        if (imgStr.startsWith('http') || imgStr.startsWith('data:')) return imgStr;
        // Remove leading slash if present in filename to avoid double slash
        const cleanFilename = imgStr.startsWith('/') ? imgStr.slice(1) : imgStr;
        return `${BASE_URL}/uploads/${folderName}/${cleanFilename}`;
    };

    // 1. Check imageUrl (often explicit full URL)
    if (product.imageUrl) {
        return processImageString(product.imageUrl);
    }

    // 2. Check image (legacy string)
    if (product.image && typeof product.image === 'string') {
        return processImageString(product.image);
    }

    // 3. Check images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return processImageString(product.images[0]);
    }

    return null;
};
