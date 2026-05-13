import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

export interface WithdrawRequestAttributes {
    id: number;
    userId: number;
    amount: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    status: 'pending' | 'approved' | 'rejected';
    adminNotes: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface WithdrawRequestCreationAttributes extends Optional<WithdrawRequestAttributes, 'id' | 'status' | 'adminNotes'> {}

export class WithdrawRequest extends Model<WithdrawRequestAttributes, WithdrawRequestCreationAttributes> implements WithdrawRequestAttributes {
    declare id: number;
    declare userId: number;
    declare amount: number;
    declare bankName: string;
    declare accountName: string;
    declare accountNumber: string;
    declare ifscCode: string;
    declare status: 'pending' | 'approved' | 'rejected';
    declare adminNotes: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initWithdrawRequestModel() {
    const sequelize = getSequelize();
    WithdrawRequest.init({
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' } },
        amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        bankName: { type: DataTypes.STRING(255), allowNull: false },
        accountName: { type: DataTypes.STRING(255), allowNull: false },
        accountNumber: { type: DataTypes.STRING(50), allowNull: false },
        ifscCode: { type: DataTypes.STRING(20), allowNull: false },
        status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
        adminNotes: { type: DataTypes.TEXT, allowNull: true },
    }, { sequelize, tableName: 'withdraw_requests', timestamps: true });
    return WithdrawRequest;
}

export default WithdrawRequest;
