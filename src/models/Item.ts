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
        },
        // Post-auction payment tracking
        winnerPaymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        lastPaymentReminder: { type: Date },
        paymentMethod: {
            type: String,
            enum: ['cash', 'online', 'bank_transfer'],
        },
        paymentCompletedAt: { type: Date },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        // Buyer's shipping address for delivery
        shippingAddress: {
            fullName: { type: String },
            phone: { type: String },
            addressLine: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
        },
        // Second-chance offer status: 'closed' (default) or 'open' (seller activated)
        secondChanceStatus: {
            type: String,
            enum: ['closed', 'open'],
            default: 'closed',
        },
        secondChanceNotifiedAt: { type: Date },
        // Second-chance offers submitted by runner-up bidders
        secondChanceOffers: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            userName: { type: String },
            userEmail: { type: String },
            originalBid: { type: Number },
            offerPrice: { type: Number },
            percentageAdjustment: { type: Number },
            sentAt: { type: Date },
            status: { type: String, enum: ['pending', 'accepted', 'rejected', 'expired'], default: 'pending' },
        }]
    },
    { timestamps: true }
);

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
