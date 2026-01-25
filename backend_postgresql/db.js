const { Sequelize } = require('sequelize');

// Wir nutzen die Variablen, die Docker uns gibt
const sequelize = new Sequelize(
    'my_shop',
    'astra',
    'monia2010', // Dein aktuelles Passwort
    {
        host: 'localhost', // WICHTIG: In Docker muss hier 'db' stehen (Name des Containers)
        dialect: 'postgres',
        logging: false,
        port: 5432,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL / Sequelize connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the PostgreSQL database:', error);
        process.exit(1);
    }
};

// Falls der Server lokal (ohne server_sql.js) gestartet wird:
if (require.main === module) {
    connectDB();
}

module.exports = { sequelize, connectDB };