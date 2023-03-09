const { getHolder } = require("./get_holder");
const { mongoConnection } = require("./service/Mongodb");

start = async () => {
    await mongoConnection();
    await getHolder();
};

start();
