import mongoose from 'mongoose';

const FanAssociationSchema = new mongoose.Schema(
    {
        heroName: { type: String, required: true }, // e.g. "Allu Arjun"
        areaName: { type: String, required: true }, // e.g. "Kakinada"
        slug: { type: String, required: true, unique: true }, // e.g. "allu-arjun-fans-kakinada"
        president: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        heroImage: { type: String }, // base64 or URL for hero photo
        bannerImage: { type: String }, // banner image
        galleryImages: [{ type: String }], // gallery photos
        description: { type: String },
        contactPhone: { type: String },
        contactEmail: { type: String },
        socialLinks: {
            facebook: { type: String },
            instagram: { type: String },
            twitter: { type: String },
            youtube: { type: String },
        },
        isActive: { type: Boolean, default: true },
        themeColor: { type: String, default: '#8b5cf6' }, // custom theme color
    },
    { timestamps: true }
);

if (mongoose.models.FanAssociation) {
    delete mongoose.models.FanAssociation;
}

export default mongoose.model('FanAssociation', FanAssociationSchema);
