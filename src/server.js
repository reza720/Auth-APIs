const app = require("./app");
const {database, env} = require("./config");

(async() => {
    try{
        await database.authenticate();
        await database.sync();
        console.log("Database is connected");

        app.listen(env.server.port ||  5000, () => {
            console.log("Server is running");
        });
    }
    catch(err){
        console.error("Erro: ", err);
        process.exit(1);
    }
})();
