import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

export interface WalletTransactionAttributes {
    id: number;
    userId: number;
    type: 'credit' | 'debit' | 'lock' | 'unlock' | 'refund' | 'payment';
    amount: number;
    description: string | null;
    auctionId: number | null;
    balanceAfter: number | null;
    lockedAfter: number | null;
    status: 'completed' | 'pending' | 'failed';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface WalletTransactionCreationAttributes extends Optional<WalletTransactionAttributes, 'id' | 'description' | 'auctionId' | 'balanceAfter' | 'lockedAfter' | 'status'> {}

export class WalletTransaction extends Model<WalletTransactionAttributes, WalletTransactionCreationAttributes> implements WalletTransactionAttributes {
    declare id: number;
    declare userId: number;
    declare type: 'credit' | 'debit' | 'lock' | 'unlock' | 'refund' | 'payment';
    declare amount: number;
    declare description: string | null;
    declare auctionId: number | null;
    declare balanceAfter: number | null;
    declare lockedAfter: number | null;
    declare status: 'completed' | 'pending' | 'failed';
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initWalletTransactionModel() {
    const sequelize = getSequelize();

    WalletTransaction.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'users', key: 'id' },
            },
            type: {
                type: DataTypes.ENUM('credit', 'debit', 'lock', 'unlock', 'refund', 'payment'),
                allowNull: false,
            },
            amount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            auctionId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: { model: 'items', key: 'id' },
            },
            balanceAfter: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true,
            },
            lockedAfter: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('completed', 'pending', 'failed'),
                allowNull: false,
                defaultValue: 'completed',
            },
        },
        {
            sequelize,
            tableName: 'wallet_transactions',
            timestamps: true,
            indexes: [
                { fields: ['userId', 'createdAt'] },
                { fields: ['auctionId'] },
            ],
        }
    );

    return WalletTransaction;
}

export default WalletTransaction;
