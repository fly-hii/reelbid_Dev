import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

export interface TierAttributes {
    id: number;
    name: string;
    minBalance: number;
    bidLimit: number;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface TierCreationAttributes extends Optional<TierAttributes, 'id' | 'order'> {}

export class Tier extends Model<TierAttributes, TierCreationAttributes> implements TierAttributes {
    declare id: number;
    declare name: string;
    declare minBalance: number;
    declare bidLimit: number;
    declare order: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initTierModel() {
    const sequelize = getSequelize();

    Tier.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            minBalance: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            bidLimit: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            tableName: 'tiers',
            timestamps: true,
        }
    );

    return Tier;
}

export default Tier;
