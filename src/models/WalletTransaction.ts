import mongoose from 'mongoose';

const WalletTransactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['credit', 'debit', 'lock', 'unlock', 'refund', 'payment'],
            required: true,
        },
        amount: { type: Number, required: true },
        description: { type: String },
        auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // linked auction if applicable
        balanceAfter: { type: Number }, // wallet balance after this transaction
        lockedAfter: { type: Number },  // locked amount after this transaction
        status: {
            type: String,
            enum: ['completed', 'pending', 'failed'],
            default: 'completed',
        },
    },
    { timestamps: true }
);

WalletTransactionSchema.index({ user: 1, createdAt: -1 });
WalletTransactionSchema.index({ auction: 1 });

export default mongoose.models.WalletTransaction ||
    mongoose.model('WalletTransaction', WalletTransactionSchema);
