import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // optional for Google OAuth
        phone: { type: String },
        image: { type: String },
        role: {
            type: String,
            enum: ['Admin', 'Seller', 'Buyer'],
            default: 'Buyer',
            required: true,
        },
        walletBalance: { type: Number, default: 0 },
        tier: {
            type: String,
            default: 'None',
        },
        // Profile completion fields
        profileCompleted: { type: Boolean, default: false },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
    },
    { timestamps: true }
);

if (mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
