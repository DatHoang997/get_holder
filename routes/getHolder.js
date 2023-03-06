var express = require("express");
const getHolderController = require("../controllers/getHolderController");

var router = express.Router();

router.get("/get-holder", getHolderController.getHolder);

module.exports = router;