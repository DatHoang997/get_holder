const { crawlData } = require("./service/get_data")
const { mongoConnection } = require("./service/Mongodb")

start = async () => {
  await mongoConnection()
  crawlData()
}

start()
