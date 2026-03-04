import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWithdrawRequest extends Document {
    user: mongoose.Types.ObjectId;
    amount: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    status: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WithdrawRequestSchema = new Schema<IWithdrawRequest>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        bankName: { type: String, required: true },
        accountName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        adminNotes: { type: String },
    },
    { timestamps: true }
);

const WithdrawRequest: Model<IWithdrawRequest> =
    mongoose.models.WithdrawRequest || mongoose.model<IWithdrawRequest>('WithdrawRequest', WithdrawRequestSchema);

export default WithdrawRequest;
