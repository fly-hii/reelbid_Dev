import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

export interface FanAssociationAttributes {
    id: number;
    heroName: string;
    areaName: string;
    state?: string | null;
    district?: string | null;
    town?: string | null;
    slug: string;
    presidentId: number;
    heroImage: string | null;
    bannerImage: string | null;
    galleryImages: string | null; // JSON array of S3 URLs
    description: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    socialLinks: string | null; // JSON object
    isActive: boolean;
    themeColor: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface FanAssociationCreationAttributes extends Optional<FanAssociationAttributes, 'id' | 'state' | 'district' | 'town' | 'heroImage' | 'bannerImage' | 'galleryImages' | 'description' | 'contactPhone' | 'contactEmail' | 'socialLinks' | 'isActive' | 'themeColor'> {}

export class FanAssociation extends Model<FanAssociationAttributes, FanAssociationCreationAttributes> implements FanAssociationAttributes {
    declare id: number;
    declare heroName: string;
    declare areaName: string;
    declare slug: string;
    declare presidentId: number;
    declare heroImage: string | null;
    declare bannerImage: string | null;
    declare galleryImages: string | null;
    declare description: string | null;
    declare contactPhone: string | null;
    declare contactEmail: string | null;
    declare socialLinks: string | null;
    declare isActive: boolean;
    declare themeColor: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    get galleryImagesArray(): string[] {
        try { return this.galleryImages ? JSON.parse(this.galleryImages) : []; } catch { return []; }
    }
    get socialLinksObj(): any {
        try { return this.socialLinks ? JSON.parse(this.socialLinks) : {}; } catch { return {}; }
    }
}

export function initFanAssociationModel() {
    const sequelize = getSequelize();
    FanAssociation.init({
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        heroName: { type: DataTypes.STRING(255), allowNull: false },
        areaName: { type: DataTypes.STRING(255), allowNull: false }, // we can keep it for backwards compatibility or display
        state: { type: DataTypes.STRING(255), allowNull: true },
        district: { type: DataTypes.STRING(255), allowNull: true },
        town: { type: DataTypes.STRING(255), allowNull: true },
        slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        presidentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' } },
        heroImage: { type: DataTypes.STRING(1024), allowNull: true },
        bannerImage: { type: DataTypes.STRING(1024), allowNull: true },
        galleryImages: { type: DataTypes.JSON, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        contactPhone: { type: DataTypes.STRING(20), allowNull: true },
        contactEmail: { type: DataTypes.STRING(255), allowNull: true },
        socialLinks: { type: DataTypes.JSON, allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        themeColor: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '#8b5cf6' },
    }, { sequelize, tableName: 'fan_associations', timestamps: true });
    return FanAssociation;
}

export default FanAssociation;
