var express = require("express");
const getHolderController = require("../controllers/getHolderController");

var router = express.Router();

router.get("/get-holder", getHolderController.getHolder);
router.get("/get-hacked", getHolderController.getHacked);
router.get("/sum", getHolderController.sum);
router.get("/copy", getHolderController.copy);
router.get("/lp", getHolderController.getLP);
router.get("/ex", getHolderController.excel);

module.exports = router;