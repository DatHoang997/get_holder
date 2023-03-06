const { getHolder } = require("./get_holder");
const { mongoConnection } = require("./service/Mongodb");

start = async () => {
    mongoConnection();
    getHolder();
};

start();
