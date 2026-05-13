import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

export interface BidAttributes {
    id: number;
    amount: number;
    userId: number;
    itemId: number;
    isTopBid: boolean;
    lockedDeposit: number;
    depositRefunded: boolean;
    status: 'active' | 'outbid' | 'won' | 'lost' | 'refunded';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BidCreationAttributes extends Optional<BidAttributes, 'id' | 'isTopBid' | 'lockedDeposit' | 'depositRefunded' | 'status'> {}

export class Bid extends Model<BidAttributes, BidCreationAttributes> implements BidAttributes {
    declare id: number;
    declare amount: number;
    declare userId: number;
    declare itemId: number;
    declare isTopBid: boolean;
    declare lockedDeposit: number;
    declare depositRefunded: boolean;
    declare status: 'active' | 'outbid' | 'won' | 'lost' | 'refunded';
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initBidModel() {
    const sequelize = getSequelize();

    Bid.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            amount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'users', key: 'id' },
            },
            itemId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'items', key: 'id' },
            },
            isTopBid: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            lockedDeposit: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },
            depositRefunded: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            status: {
                type: DataTypes.ENUM('active', 'outbid', 'won', 'lost', 'refunded'),
                allowNull: false,
                defaultValue: 'active',
            },
        },
        {
            sequelize,
            tableName: 'bids',
            timestamps: true,
            indexes: [
                { fields: ['itemId', 'userId'] },
                { fields: ['userId', 'status'] },
            ],
        }
    );

    return Bid;
}

export default Bid;
