import { connectMySQL, getSequelize } from './mysql';
import { initAllModels } from '@/models/index';

let synced = false;

async function connectDB() {
    await connectMySQL();
    initAllModels();

    if (!synced) {
        const sequelize = getSequelize();
        // Use alter:true in development to auto-update tables
        // Use force:false to avoid dropping tables
        await sequelize.sync({ alter: true });
        console.log('MySQL tables synced');
        synced = true;
    }
}

export default connectDB;
