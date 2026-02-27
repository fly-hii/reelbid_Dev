import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema(
    {
        amount: { type: Number, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        isTopBid: { type: Boolean, default: false },
        lockedDeposit: { type: Number, default: 0 }, // security deposit locked for this bid
        depositRefunded: { type: Boolean, default: false }, // has the deposit been refunded
        status: {
            type: String,
            enum: ['active', 'outbid', 'won', 'lost', 'refunded'],
            default: 'active',
        },
    },
    { timestamps: true }
);

BidSchema.index({ item: 1, user: 1 });
BidSchema.index({ user: 1, status: 1 });

export default mongoose.models.Bid || mongoose.model('Bid', BidSchema);
