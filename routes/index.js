let express = require("express");

const getHolderRouter = require("./getHolder");

let app = express();

app.use("/holder/", getHolderRouter);


module.exports = app;