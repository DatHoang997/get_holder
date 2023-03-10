fs = require("fs");
const { utils, ethers } = require("ethers");
const apiResponse = require("../helpers/apiResponse");
const Wallet = require("../models/events");
const holder = require("../holder.json");
const bn = ethers.BigNumber.from;

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
        let holder = await Wallet.find(
            {},
            { address: 1, block1: 1, block2: 1, block3: 1, _id: 0 },
        ).lean();
        fs = require("fs");
        let result = JSON.stringify(holder);
        await fs.writeFileSync("holder.json", result, (error) => {});

        return apiResponse.successResponseWithData(
            res,
            "Operation success"
        );
    },
];

exports.excel = [
    async (req, res) => {
        const xl = require("excel4node");
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet("Worksheet Name");
        const data = [
            {
                address: "0x0e7165087d3ac987c695739f26ae164ee0078e2b",
                block1: "1520677072980000",
                block2: "1520677072980000",
                block3: "1520677072980000",
            },
        ];
        const headingColumnNames = ["address", "block1", "block2", "block3"];
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
        await wb.write("data.xlsx");
        return apiResponse.successResponseWithData(res, "Operation success");
    },
];
