const {
    getHolder,
    calculateBalance,
    getTx,
    getTxInfo,
    getPrice,
    checkContract,
    checkWalletContract,
    getTo,
    format,
} = require("./service/get_holder");
const {
  userSwap,
} = require("./service/user_swap");

const { mongoConnection } = require("./service/Mongodb");
const { getProvider } = require("./service/AssistedProvider");

start = async () => {
    await mongoConnection();
    getHolder();
};

start();
