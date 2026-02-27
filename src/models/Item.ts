import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        images: [{ type: String }],
        category: { type: String, default: 'General' },
        startingPrice: { type: Number, required: true },
        currentPrice: {
            type: Number, default: function (this: any) {
                return this.startingPrice || 0;
            }
        },
        securityPercentage: { type: Number, required: true, default: 5, min: 1, max: 50 },
        highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        finalAmount: { type: Number }, // final payment amount after auction ends
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        bidCount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['Draft', 'Active', 'Completed', 'Cancelled'],
            default: 'Active',
        }
    },
    { timestamps: true }
);

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
