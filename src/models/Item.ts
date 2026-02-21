import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        images: [{ type: String }],
        startingPrice: { type: Number, required: true },
        currentPrice: {
            type: Number, default: function (this: any) {
                return this.startingPrice || 0;
            }
        },
        highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['Draft', 'Active', 'Completed', 'Cancelled'],
            default: 'Active',
        }
    },
    { timestamps: true }
);

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
