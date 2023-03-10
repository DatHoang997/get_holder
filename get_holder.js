const Wallet = require("./models/events");
const Data = require("./models/data");
const Web3 = require("web3");
const fetch = require("node-fetch");
const { ethers } = require("ethers");

const lz_address = "0x3b78458981eb7260d1f781cb8be2caac7027dbe2";
const api_key = "VSUEYZSSBWGFSMZ9XU1RECMWZWVMQ4R3G9";
const bn = ethers.BigNumber.from;

getHolder = async () => {
    await getApi(0, 26024907); //26024907
};

getApi = async (fromBlock, toBlock) => {
    const response = await fetch(
        `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${lz_address}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=10000&sort=asc&apikey=${api_key}`,
    );
    console.log(
        `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${lz_address}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=10000&sort=asc&apikey=${api_key}`,
    );
    try {
        const body = JSON.parse(await response.text());
        console.log(body.result.length);
        const lastBlock = body.result[body.result.length - 1].blockNumber;
        await saveData(body.result, lastBlock);
    } catch (error) {
        console.log(error, { fromBlock, toBlock });
        getApi(fromBlock, toBlock);
    }
};

// saveData = async (data, lastBlock) => {
//     console.log("saving data...");
//     let continueBlock = parseInt(data[data.length - 1].blockNumber) + 1;
//     for (let i = 0; i < data.length - 1; i++) {
//         if (data.length == 10000 && data[i].blockNumber == lastBlock) {
//             continueBlock = parseInt(data[data.length - 1].blockNumber);
//             continue;
//         }

//         const { from, to, value } = data[i];

//         const fromWallet = await Wallet.findOne({ address: from }).lean();
//         const toWallet = await Wallet.findOne({ address: to }).lean();

//         let fromBalance, toBalance;
//         if (!fromWallet) fromBalance = bn("0").sub(value);
//         if (!toWallet) toBalance = bn("0").add(value);

//         if (fromWallet) fromBalance = bn(fromWallet.block1).sub(value);
//         if (toWallet) toBalance = bn(toWallet.block3).add(value);

//         await Wallet.updateOne(
//             { address: from },
//             { block1: fromBalance, block2: fromBalance, block3: fromBalance },
//             { upsert: true },
//         );
//         await Wallet.updateOne(
//             { address: to },
//             { block1: toBalance, block2: toBalance, block3: toBalance },
//             { upsert: true },
//         );
//     }
//     console.log("data saved!");
//     if (data.length < 10000) {
//         process.exit();
//     }
//     console.log("continue form ", continueBlock);
//     getApi(continueBlock, 26024419);
// };

saveData = async (data, lastBlock) => {
    console.log("saving data...");
    let continueBlock = lastBlock + 1;
    for (let i = 0; i < data.length; i++) {
        if (data.length == 10000 && data[i].blockNumber == lastBlock) {
            continueBlock = lastBlock;
            continue;
        }
        await Data.create({
            blockNumber: data[i].blockNumber,
            from: data[i].from,
            to: data[i].to,
            value: data[i].value,
        });
    }
    console.log("data saved!");
    if (data.length < 10000) {
        process.exit();
    }
    getApi(continueBlock, 26024907);
};

const calculateBalance = async () => {
    const data = await Data.find().lean();
    let i = 0;
    for (let doc of data) {
        const { from, to, value, blockNumber } = doc;
        if (from == to) continue;
        const fromWallet = await Wallet.findOne({ address: from }).lean();
        const toWallet = await Wallet.findOne({ address: to }).lean();
        let fromBalance, toBalance;
        if (!fromWallet) fromBalance = bn("0").sub(value);
        if (!toWallet) toBalance = bn("0").add(value);

        if (fromWallet) fromBalance = bn(fromWallet.block3).sub(value);
        if (toWallet) toBalance = bn(toWallet.block3).add(value);
        if (parseInt(blockNumber) <= 26024419) {
            await Wallet.updateOne(
                { address: from },
                {
                    block1: fromBalance,
                    block2: fromBalance,
                    block3: fromBalance,
                },
                { upsert: true },
            );
            await Wallet.updateOne(
                { address: to },
                { block1: toBalance, block2: toBalance, block3: toBalance },
                { upsert: true },
            );
        }

        if (parseInt(blockNumber) <= 26024420) {
            await Wallet.updateOne(
                { address: from },
                {
                    block2: fromBalance,
                    block3: fromBalance,
                },
                { upsert: true },
            );
            await Wallet.updateOne(
                { address: to },
                { block2: toBalance, block3: toBalance },
                { upsert: true },
            );
        }
        if (parseInt(blockNumber) > 26024420) {
            await Wallet.updateOne(
                { address: from },
                {
                    block3: fromBalance,
                },
                { upsert: true },
            );
            await Wallet.updateOne(
                { address: to },
                { block3: toBalance },
                { upsert: true },
            );
        }
        i++;
        console.log(i);
    }
    console.log("done");
    process.exit();
};

module.exports = {
    getHolder,
    calculateBalance,
};
