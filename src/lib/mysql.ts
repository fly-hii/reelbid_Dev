import { Sequelize } from 'sequelize';

const MYSQL_HOST = process.env.MYSQL_HOST || '43.204.189.106';
const MYSQL_USER = process.env.MYSQL_USER || 'reelbiddbuser';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'Adm!n$2030';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'reelbiddb';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);

let sequelizeInstance: Sequelize | null = null;

export function getSequelize(): Sequelize {
    if (!sequelizeInstance) {
        sequelizeInstance = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
            host: MYSQL_HOST,
            port: MYSQL_PORT,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
            dialectOptions: {
                connectTimeout: 10000,
            },
        });
    }
    return sequelizeInstance;
}

let connected = false;

export async function connectMySQL(): Promise<Sequelize> {
    const sequelize = getSequelize();

    if (!connected) {
        try {
            await sequelize.authenticate();
            console.log('MySQL connected successfully');
            connected = true;
        } catch (error) {
            console.error('MySQL connection failed:', error);
            throw error;
        }
    }

    return sequelize;
}

export default connectMySQL;
