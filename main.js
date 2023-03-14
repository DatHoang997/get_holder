const { getHolder, calculateBalance, getTx } = require("./service/get_holder");
const { mongoConnection } = require("./service/Mongodb");
const { getProvider } = require("./service/AssistedProvider");

start = async () => {
    await mongoConnection();
    getTx()
};

start();
