import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema(
    {
        amount: { type: Number, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        isTopBid: { type: Boolean, default: false }, // to make querying top bids easy
    },
    { timestamps: true }
);

export default mongoose.models.Bid || mongoose.model('Bid', BidSchema);
