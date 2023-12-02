const mongoose = require("mongoose")
const mongo_url = "mongodb://127.0.0.1:27017/test"

mongoConnection = async () => {
  console.log("alooo")
  return mongoose
    .connect(mongo_url)
    .then(() => {
      console.log("Connected to %s", mongo_url)
      console.log("Press CTRL + C to stop the process. \n")
    })
    .catch((err) => {
      console.error("App starting error:", err.message)
      process.exit(1)
    })
}

module.exports = {
  mongoConnection,
}
