fs = require("fs");
const HackedData = require("../models/hacked_data");
const { ethers } = require("ethers");
const bn = ethers.BigNumber.from;
const apiResponse = require("../helpers/apiResponse");
const BottomFishing = require("../models/bottom_fishing");
const Lp = require("../models/lp");
const Address = require("../models/address");
const data = require("../data.json");
const Tx = require("../models/tx");

exports.sum = [
  async (req, res) => {
    let holders = await Wallet.find(
      {},
      { address: 1, block1: 1, block2: 1, block3: 1, _id: 0 },
    );
    let sum = bn(0);
    for (let holder of holders) {
      // if (
      //     bn(holder.block1).lt("500000000000000000") &&
      //     bn(holder.block1).gt("0")
      // )
      sum = sum.add(holder.block1);
    }
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      sum.toString(),
    );
  },
];

