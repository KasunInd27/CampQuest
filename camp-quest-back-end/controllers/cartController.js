import Cart from '../models/Cart.js';
import SalesProduct from '../models/SalesProduct.js';
import RentalProduct from '../models/RentalProduct.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        select: 'name images price dailyRate weeklyRate stock availableQuantity availabilityStatus'
    });

    if (!cart) {
        // Return empty cart structure if none exists
        return res.status(200).json({ success: true, data: [] });
    }

    // Filter out items where the product reference is null (deleted products)
    const validItems = cart.items.filter(item => item.product);

    // If we filtered out items, save the clean cart
    if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
    }

    // Transform for frontend: flatten the structure slightly if needed, or send as is
    // The frontend expects the full product object merged with quantity etc.
    const formattedItems = cart.items.map(item => {
        const product = item.product;
        return {
            ...product.toObject(),
            productModel: item.productModel, // Helper for knowing which collection
            _id: product._id, // Ensure ID is top level
            cartItemId: item._id,
            quantity: item.quantity,
            rentalDays: item.rentalDays,
            itemType: item.type, // 'sale' or 'rental'
            type: item.type, // Frontend uses 'type'
            price: item.price // Snapshot price or current price? Usually we want current for display, snapshot for order. 
            // Frontend logic uses product.price. Let's keep consistency.
        };
    });

    res.status(200).json({
        success: true,
        data: formattedItems
    });
});

// @desc    Add item to cart / Sync cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, type, quantity, rentalDays, productModel } = req.body;

    // 1. Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // 2. Determine price and validity
    let product;
    let model = productModel;

    if (!model) {
        // Infer model if not sent
        model = type === 'rental' ? 'RentalProduct' : 'SalesProduct';
    }

    if (model === 'SalesProduct') {
        product = await SalesProduct.findById(productId);
    } else {
        product = await RentalProduct.findById(productId);
    }

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const price = model === 'SalesProduct' ? product.price : product.dailyRate;

    // 3. Check if item exists in cart
    const existingItemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId && item.type === type
    );

    if (existingItemIndex > -1) {
        // Update quantity
        // If the request specifies to SET quantity (from sync) vs ADD? 
        // Typically simpler to specific "new quantity" or "increment". 
        // For this implementation, let's assume "addToCart" logic from frontend = "add 1" or "set parameters"

        // Actually, frontend addToCart sends "items". 
        // Let's support an "add" operation.

        // However, usually we might want to just set the quantity if it's an update.
        // Let's assume the frontend sends the *target* quantity if updating, or we increment if it's a fresh add.
        // For simplicity with the existing frontend flow, let's assume we are adding to existing or setting.

        // The frontend logic usually handles "existingItem.quantity + 1".
        // So the Body will contain the FINAL quantity.
        cart.items[existingItemIndex].quantity = quantity;
        if (rentalDays) cart.items[existingItemIndex].rentalDays = rentalDays;
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            productModel: model,
            type,
            quantity,
            rentalDays: rentalDays || 1,
            price
        });
    }

    await cart.save();

    // Refetch to populate and return formatted items
    const updatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name images price dailyRate weeklyRate stock availableQuantity availabilityStatus'
    });

    const formattedItems = updatedCart.items.map(item => {
        const product = item.product;
        // Skip valid check here as we just added it, but good practice to handle populated nulls if any
        if (!product) return null;
        return {
            ...product.toObject(),
            productModel: item.productModel,
            _id: product._id,
            cartItemId: item._id,
            quantity: item.quantity,
            rentalDays: item.rentalDays,
            itemType: item.type,
            type: item.type,
            price: item.price
        };
    }).filter(item => item !== null);

    res.status(200).json({ success: true, message: 'Cart updated', data: formattedItems });
});


// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { type } = req.query; // Need type to distinguish rental/sale for same ID? (Unlikely to have same ID across collections but safer)

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.status(200).json({ success: true, data: [] });
    }

    cart.items = cart.items.filter(item => {
        // If type is provided, match both. If not, match ID only (risky if cross-collection collision, but IDs are usually unique in Mongo)
        if (type) {
            return !(item.product.toString() === productId && item.type === type);
        }
        return item.product.toString() !== productId;
    });

    await cart.save();

    res.status(200).json({ success: true, message: 'Item removed' });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ success: true, message: 'Cart cleared' });
});
