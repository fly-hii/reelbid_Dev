import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

export interface FanMemberAttributes {
    id: number;
    associationId: number;
    title: string;
    name: string;
    designation: string;
    phone: string | null;
    photo: string | null; // S3 URL
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface FanMemberCreationAttributes extends Optional<FanMemberAttributes, 'id' | 'phone' | 'photo' | 'order'> {}

export class FanMember extends Model<FanMemberAttributes, FanMemberCreationAttributes> implements FanMemberAttributes {
    declare id: number;
    declare associationId: number;
    declare title: string;
    declare name: string;
    declare designation: string;
    declare phone: string | null;
    declare photo: string | null;
    declare order: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initFanMemberModel() {
    const sequelize = getSequelize();
    FanMember.init({
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        associationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'fan_associations', key: 'id' } },
        title: { type: DataTypes.STRING(20), allowNull: false },
        name: { type: DataTypes.STRING(255), allowNull: false },
        designation: { type: DataTypes.STRING(100), allowNull: false },
        phone: { type: DataTypes.STRING(20), allowNull: true },
        photo: { type: DataTypes.STRING(1024), allowNull: true },
        order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    }, { sequelize, tableName: 'fan_members', timestamps: true });
    return FanMember;
}

export default FanMember;
