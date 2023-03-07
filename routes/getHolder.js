var express = require("express");
const getHolderController = require("../controllers/getHolderController");

var router = express.Router();

router.get("/get-holder", getHolderController.getHolder);
router.get("/copy-block", getHolderController.copyBlock);
router.get("/count", getHolderController.count);
router.get("/ex", getHolderController.excel);

module.exports = router;