import mongoose from 'mongoose';

const specialPackageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    includes: [{
        type: String,
        trim: true
    }],
    imageUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate slug from name before saving
specialPackageSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Append timestamp if slug already exists is handled by controller/unique constraint usually,
        // but for simple uniqueness we can append random string if needed. 
        // For now, let's assume simple slug generation is enough or controller handles duplicates.
        // Ideally, we'd check for uniqueness here or handle E11000 in controller.
    }
    next();
});

const SpecialPackage = mongoose.model('SpecialPackage', specialPackageSchema);

export default SpecialPackage;
