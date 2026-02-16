import { Sequelize } from 'sequelize';

let sequelize;

function getSequelize() {
    if (!sequelize) {
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
