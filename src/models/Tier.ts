import mongoose from 'mongoose';

const TierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },      // e.g. "Tier A"
        minBalance: { type: Number, required: true },               // Minimum wallet balance to qualify
        bidLimit: { type: Number, required: true },                  // Maximum bid amount allowed
        order: { type: Number, required: true, default: 0 },        // Sort order (higher = better tier)
    },
    { timestamps: true }
);

export default mongoose.models.Tier || mongoose.model('Tier', TierSchema);
