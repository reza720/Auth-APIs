const {Sequelize}=require("sequelize");
const env=require("./env.config");

const database = new Sequelize (
    env.database.dbName,
    env.database.user,
    env.database.password,
    {
        host:env.database.host,
        dialect:"mysql",
        logging:false
    }
);
module.exports = database;

console.log({
    database: env.database.dbName,
    user: env.database.user,
    password: env.database.password,
    host: env.database.host
});