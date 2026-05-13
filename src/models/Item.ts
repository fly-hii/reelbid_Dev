import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

export interface ItemAttributes {
    id: number;
    title: string;
    movieName: string | null;
    description: string;
    images: string | null; // JSON array of S3 URLs
    category: string;
    startingPrice: number;
    currentPrice: number;
    securityPercentage: number;
    highestBidderId: number | null;
    winnerId: number | null;
    finalAmount: number | null;
    sellerId: number;
    revenueShares: string | null; // JSON array
    platformFeeType: 'percentage' | 'fixed';
    platformFeeValue: number;
    startDate: Date;
    endDate: Date;
    bidCount: number;
    status: 'Draft' | 'Pending' | 'Active' | 'Completed' | 'Cancelled';
    winnerPaymentStatus: 'pending' | 'paid' | 'failed';
    lastPaymentReminder: Date | null;
    paymentMethod: 'cash' | 'online' | 'bank_transfer' | null;
    paymentCompletedAt: Date | null;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    shippingAddress: string | null; // JSON object
    secondChanceStatus: 'closed' | 'open';
    secondChanceNotifiedAt: Date | null;
    secondChanceOffers: string | null; // JSON array
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ItemCreationAttributes extends Optional<ItemAttributes, 'id' | 'movieName' | 'images' | 'category' | 'currentPrice' | 'securityPercentage' | 'highestBidderId' | 'winnerId' | 'finalAmount' | 'revenueShares' | 'platformFeeType' | 'platformFeeValue' | 'bidCount' | 'status' | 'winnerPaymentStatus' | 'lastPaymentReminder' | 'paymentMethod' | 'paymentCompletedAt' | 'razorpayOrderId' | 'razorpayPaymentId' | 'shippingAddress' | 'secondChanceStatus' | 'secondChanceNotifiedAt' | 'secondChanceOffers'> {}

export class Item extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
    declare id: number;
    declare title: string;
    declare movieName: string | null;
    declare description: string;
    declare images: string | null;
    declare category: string;
    declare startingPrice: number;
    declare currentPrice: number;
    declare securityPercentage: number;
    declare highestBidderId: number | null;
    declare winnerId: number | null;
    declare finalAmount: number | null;
    declare sellerId: number;
    declare revenueShares: string | null;
    declare platformFeeType: 'percentage' | 'fixed';
    declare platformFeeValue: number;
    declare startDate: Date;
    declare endDate: Date;
    declare bidCount: number;
    declare status: 'Draft' | 'Pending' | 'Active' | 'Completed' | 'Cancelled';
    declare winnerPaymentStatus: 'pending' | 'paid' | 'failed';
    declare lastPaymentReminder: Date | null;
    declare paymentMethod: 'cash' | 'online' | 'bank_transfer' | null;
    declare paymentCompletedAt: Date | null;
    declare razorpayOrderId: string | null;
    declare razorpayPaymentId: string | null;
    declare shippingAddress: string | null;
    declare secondChanceStatus: 'closed' | 'open';
    declare secondChanceNotifiedAt: Date | null;
    declare secondChanceOffers: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    // Virtual getters for JSON fields
    get imagesArray(): string[] {
        try { return this.images ? JSON.parse(this.images) : []; } catch { return []; }
    }
    get revenueSharesArray(): any[] {
        try { return this.revenueShares ? JSON.parse(this.revenueShares) : []; } catch { return []; }
    }
    get shippingAddressObj(): any {
        try { return this.shippingAddress ? JSON.parse(this.shippingAddress) : null; } catch { return null; }
    }
    get secondChanceOffersArray(): any[] {
        try { return this.secondChanceOffers ? JSON.parse(this.secondChanceOffers) : []; } catch { return []; }
    }
}

export function initItemModel() {
    const sequelize = getSequelize();

    Item.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            movieName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            images: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: null,
            },
            category: {
                type: DataTypes.STRING(100),
                allowNull: false,
                defaultValue: 'General',
            },
            startingPrice: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            currentPrice: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },
            securityPercentage: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 5,
            },
            highestBidderId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: { model: 'users', key: 'id' },
            },
            winnerId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: { model: 'users', key: 'id' },
            },
            finalAmount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true,
            },
            sellerId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'users', key: 'id' },
            },
            revenueShares: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: null,
            },
            platformFeeType: {
                type: DataTypes.ENUM('percentage', 'fixed'),
                allowNull: false,
                defaultValue: 'percentage',
            },
            platformFeeValue: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            bidCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.ENUM('Draft', 'Pending', 'Active', 'Completed', 'Cancelled'),
                allowNull: false,
                defaultValue: 'Pending',
            },
            winnerPaymentStatus: {
                type: DataTypes.ENUM('pending', 'paid', 'failed'),
                allowNull: false,
                defaultValue: 'pending',
            },
            lastPaymentReminder: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            paymentMethod: {
                type: DataTypes.ENUM('cash', 'online', 'bank_transfer'),
                allowNull: true,
            },
            paymentCompletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            razorpayOrderId: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            razorpayPaymentId: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            shippingAddress: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            secondChanceStatus: {
                type: DataTypes.ENUM('closed', 'open'),
                allowNull: false,
                defaultValue: 'closed',
            },
            secondChanceNotifiedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            secondChanceOffers: {
                type: DataTypes.JSON,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'items',
            timestamps: true,
        }
    );

    return Item;
}

export default Item;
