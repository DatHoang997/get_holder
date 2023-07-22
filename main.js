const { getData } = require("./service/getData")
const { userSwap } = require("./service/userSwap")

const { mongoConnection } = require("./service/Mongodb")
const { getProvider } = require("./service/AssistedProvider")

start = async () => {
  await mongoConnection()
  getData()
}

start()
