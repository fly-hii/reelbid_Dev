import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '@/lib/mysql';

export interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password: string | null;
    phone: string | null;
    image: string | null;
    role: 'Admin' | 'Seller' | 'Buyer' | 'President';
    walletBalance: number;
    lockedBalance: number;
    walletHash: string | null;
    tier: string;
    isApproved: boolean;
    profileCompleted: boolean;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password' | 'phone' | 'image' | 'walletBalance' | 'lockedBalance' | 'walletHash' | 'tier' | 'isApproved' | 'profileCompleted' | 'address' | 'city' | 'state' | 'pincode'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare id: number;
    declare name: string;
    declare email: string;
    declare password: string | null;
    declare phone: string | null;
    declare image: string | null;
    declare role: 'Admin' | 'Seller' | 'Buyer' | 'President';
    declare walletBalance: number;
    declare lockedBalance: number;
    declare walletHash: string | null;
    declare tier: string;
    declare isApproved: boolean;
    declare profileCompleted: boolean;
    declare address: string | null;
    declare city: string | null;
    declare state: string | null;
    declare pincode: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initUserModel() {
    const sequelize = getSequelize();

    User.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING(1024),
                allowNull: true,
            },
            role: {
                type: DataTypes.ENUM('Admin', 'Seller', 'Buyer', 'President'),
                allowNull: false,
                defaultValue: 'Buyer',
            },
            walletBalance: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },
            lockedBalance: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },
            walletHash: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            tier: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'None',
            },
            isApproved: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            profileCompleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            address: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            city: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            state: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            pincode: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'users',
            timestamps: true,
        }
    );

    return User;
}

export default User;
