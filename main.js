const { getHolder, calculateBalance } = require("./get_holder");
const { mongoConnection } = require("./service/Mongodb");

start = async () => {
    await mongoConnection();
    await calculateBalance();
};

start();
