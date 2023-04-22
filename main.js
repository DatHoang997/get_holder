const {
    getHolder,
    calculateBalance,
    getTx,
    getTxInfo,
    getPrice,
    checkContract,
    checkWalletContract,
} = require("./service/get_holder");
const { mongoConnection } = require("./service/Mongodb");
const { getProvider } = require("./service/AssistedProvider");

start = async () => {
    await mongoConnection();
    getHolder();
};

start();
