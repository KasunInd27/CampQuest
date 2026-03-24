import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One cart per user
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'items.productModel' // Dynamic reference
        },
        productModel: {
            type: String,
            required: true,
            enum: ['SalesProduct', 'RentalProduct']
        },
        // We store minimal info needed to reconstruct cart, plus any rental specifics
        type: {
            type: String,
            enum: ['sale', 'rental'],
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        rentalDays: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            required: true
        }
    }]
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
