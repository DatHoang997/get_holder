fs = require("fs");
const { utils, ethers } = require("ethers");
const apiResponse = require("../helpers/apiResponse");
const Wallet = require("../models/events");
const holder = require("../holder.json")
const bn = ethers.BigNumber.from;

exports.getHolder = [
    async (req, res) => {
        let holder = await Wallet.find(
            { block1: { $gt: 0 }, block2: { $gt: 0 }, block3: { $gt: 0 } },
            { address: 1, block1: 1, block2: 1, block3: 2, _id: 0 },
        );
        fs = require("fs");

        let holderJson = JSON.stringify(holder);
        await fs.writeFileSync("holder.json", holderJson, (error) => {});
        return apiResponse.successResponseWithData(
            res,
            "Operation success",
            holder,
        );
    },
];

exports.copyBlock = [
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

// exports.count = [
//     async (req, res) => {
//         let holders = await Wallet.find({});
//         let count = [];
//         let sum = 0;
//         for (let holder of holders) {
//             if (
//                 bn(holder.block1).lte("100000000000000000") &&
//                 bn(holder.block1).gt("0")
//             ) {
//                 Wallet.updateOne({ address: holder.address }, { block1: 0 });
//                 sum = bn(sum).add(holder.block1);
//                 count.push({
//                     address: holder.address,
//                     balance: utils.formatEther(holder.block1),
//                 });
//             }
//         }
//         console.log(count.length);
//         console.log(sum.toString());
//         return apiResponse.successResponseWithData(
//             res,
//             "Operation success",
//             count,
//         );
//     },
// ];

exports.count = [
    async (req, res) => {
        // Wallet.create({
        //     address: "0xbe8784e13d95020ad182af4ca1560287b493aaf9",
        //     block1: "520457839576894000000",
        //     block2: "520457839576894000000",
        //     block3: "520457839576894000000",
        // });
        Wallet.create({
            address: "0x33da6d2e7f03cfca9ef1093e6d52f53f63afdb2f",
            block1: "647473650000000000000",
            block2: "647473650000000000000",
            block3: "647473650000000000000",
        });
        Wallet.create({
            address: "0xbd069a0f0755725be07f830d43def37b0d8b7bc4",
            block1: "545344375578000000000",
            block2: "545344375578000000000",
            block3: "545344375578000000000",
        });
        Wallet.create({
            address: "0xc3e2ac741187d651373f00d5a272ce096cd934a1",
            block1: "443381288396000000000",
            block2: "443381288396000000000",
            block3: "443381288396000000000",
        });
        return apiResponse.successResponseWithData(res, "Operation success");
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
        holder.forEach((record) => {
            let columnIndex = 1;
            Object.keys(record).forEach((columnName) => {
                ws.cell(rowIndex, columnIndex++).string(record[columnName]);
            });
            rowIndex++;
        });
        wb.write("data.xlsx");
        return apiResponse.successResponseWithData(
            res,
            "Operation success",
        );
    },
];
