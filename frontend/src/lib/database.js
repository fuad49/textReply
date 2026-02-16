import { Sequelize } from 'sequelize';

let sequelize;

function getSequelize() {
    if (!sequelize) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            logging: false,
            pool: {
                max: 3,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
        });
    }
    return sequelize;
}

export default getSequelize;
