const Wallet = require("../models/events");
const HackedData = require("../models/hacked_data");
const Data = require("../models/data");
const Web3 = require("web3");
const fetch = require("node-fetch");
const { swapXContract, range, bn, api_key } = require("../util/constant");
const endpoint = `https://bsc-dataseed3.ninicoin.io	`;
const web3Default = new Web3(endpoint);
getHolder = async () => {
    await getApi(0, 26423466); //26024907
};

getApi = async (fromBlock, toBlock) => {
    // `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${lz_address}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=${range}&sort=asc&apikey=${api_key}`,
    const url = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&topic0=0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925&topic0_2_opr=and&topic2=${swapXContract[1]}&apikey=${api_key}`;
    const response = await fetch(url);
    console.log(url);
    try {
        const body = JSON.parse(await response.text());
        console.log(body.result.length);
        const lastBlock = parseInt(
            body.result[body.result.length - 1].blockNumber,
            16,
        );
        await saveData(body.result, lastBlock);
    } catch (error) {
        console.log(error, { fromBlock, toBlock });
        getApi(fromBlock, toBlock);
    }
};

const getTx = async () => {
    // let tx = await web3Default.eth.getTransaction('0x44d4c8f3c9238d91fdfbc93ed2f472004e65a4e3d71a0ae9b7ed0014ec4f374e');
    // console.log(tx)
    // return
    let data = await HackedData.find({tx_origin: "0"}).lean();
    if(data.length == 0) process.exit()
    for (let i = 0; i < data.length; i++) {
        let tx = await web3Default.eth.getTransaction(data[i].tx_hash);
        console.log(i + 1, "/", data.length);
        if (!tx) continue
        if (data[i].owner == tx.from) {
            // console.log(tx)
            // console.log(data[i])
            await HackedData.deleteOne({_id: data[i]._id});
            continue;
        }
        await HackedData.updateOne({_id: data[i]._id}, {tx_origin: tx.from})
    }
    getTx()
};

// saveData = async (data, lastBlock) => {
//     console.log("saving data...");
//     let continueBlock = parseInt(data[data.length - 1].blockNumber) + 1;
//     for (let i = 0; i < data.length - 1; i++) {
//         if (data.length == range && data[i].blockNumber == lastBlock) {
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
//     if (data.length < range) {
//         process.exit();
//     }
//     console.log("continue form ", continueBlock);
//     getApi(continueBlock, 26024419);
// };

saveData = async (data, lastBlock) => {
    console.log("saving data...");
    let continueBlock = lastBlock + 1;
    for (let i = 0; i < data.length; i++) {
        if (data.length == range && data[i].blockNumber == lastBlock) {
            continueBlock = lastBlock;
            continue;
        }
        let owner = Web3.utils.toChecksumAddress("0x" + data[i].topics[1].slice(26));
        let spender = Web3.utils.toChecksumAddress("0x" + data[i].topics[2].slice(26));
        await HackedData.create({
            tx_hash: data[i].transactionHash,
            address: Web3.utils.toChecksumAddress(data[i].address),
            owner,
            spender,
        });
    }
    console.log("data saved!");
    if (data.length < range) {
        process.exit();
    }
    getApi(continueBlock, 26423466);
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
    getTx,
};
