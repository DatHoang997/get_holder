fs = require("fs");
const HackedData = require("../models/hacked_data");
const { ethers } = require("ethers");
const bn = ethers.BigNumber.from;
const apiResponse = require("../helpers/apiResponse");
const Wallet = require("../models/events");
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

exports.copy = [
  async (req, res) => {
    console.log("copyBlock");
    let holders = await Wallet.find({});
    for (let holder of holders) {
      await Wallet.updateOne(
        { address: holder.address },
        { block2: holder.block1, block3: holder.block1 },
      );
    }
    return apiResponse.successResponseWithData(res, "Operation success");
  },
];

exports.getHolder = [
  async (req, res) => {
    let holder = await BottomFishing.find(
      {},
      {
        blocknumber: 1,
        tx_hash: 1,
        tx_origin: 1,
        from: 1,
        to: 1,
        amount: 1,
        price: 1,
        transfer: 1,
        _id: 0,
      },
    ).lean();
    let doc = [];
    fs = require("fs");

    let result = JSON.stringify(holder);
    console.log("result", result.length);
    await fs.writeFileSync("BottomFishing.json", result, (error) => {});

    return apiResponse.successResponseWithData(res, "Operation success");
  },
];

exports.getLP = [
  async (req, res) => {
    let holder = await Tx.find(
      {},
      {
        _id: 0,
        __v: 0,
      },
    ).lean();
    fs = require("fs");

    let result = JSON.stringify(holder);
    await fs.writeFileSync("data.json", result, (error) => {});

    return apiResponse.successResponseWithData(res, "Operation success");
  },
];

exports.getHacked = [
  async (req, res) => {
    let wallet = await HackedData.find(
      {},
      {
        __v: 0,
        _id: 0,
      },
    ).lean();
    console.log(wallet);
    fs = require("fs");
    let result = JSON.stringify(wallet);
    await fs.writeFileSync("data1.json", result, (error) => {});

    return apiResponse.successResponseWithData(res, "Operation success");
  },
];

exports.excel = [
  async (req, res) => {
    const xl = require("excel4node");
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet("Worksheet Name");
    // const data = [
    //   {
    //     address: "0x0e7165087d3ac987c695739f26ae164ee0078e2b",
    //     block1: "1520677072980000",
    //     block2: "1520677072980000",
    //     block3: "1520677072980000",
    //   },
    // ];
    const headingColumnNames = [

    ];
    //Write Column Title in Excel file
    let headingColumnIndex = 1;
    headingColumnNames.forEach((heading) => {
      ws.cell(1, headingColumnIndex++).string(heading);
    });
    //Write Data in Excel file
    let rowIndex = 2;
    data.forEach((record) => {
      let columnIndex = 1;
      Object.keys(record).forEach((columnName) => {
        ws.cell(rowIndex, columnIndex++).string(record[columnName]);
      });
      rowIndex++;
    });
    await wb.write("to.xlsx");
    return apiResponse.successResponseWithData(res, "Operation success");
  },
];
