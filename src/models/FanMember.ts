import mongoose from 'mongoose';

const FanMemberSchema = new mongoose.Schema(
    {
        association: { type: mongoose.Schema.Types.ObjectId, ref: 'FanAssociation', required: true },
        title: { type: String, required: true }, // e.g. "Mr.", "Mrs.", "Sri"
        name: { type: String, required: true },
        designation: { type: String, required: true }, // e.g. "Vice President", "Secretary", "Treasurer", "Member"
        phone: { type: String },
        photo: { type: String }, // base64 or URL
        order: { type: Number, default: 0 }, // for sorting display order
    },
    { timestamps: true }
);

if (mongoose.models.FanMember) {
    delete mongoose.models.FanMember;
}

export default mongoose.model('FanMember', FanMemberSchema);
