const Wallet = require("../models/events");
const Lp = require("../models/lp");
const HackedData = require("../models/hacked_data");
const Data = require("../models/data");
const BottomFishing = require("../models/bottom_fishing");
const Web3 = require("web3");
const fetch = require("node-fetch");
const {
    swapXContract,
    range,
    bn,
    api_key,
    lz_address,
} = require("../util/constant");
const endpoint = `https://bsc-dataseed1.defibit.io`;
const web3Default = new Web3(endpoint);
const tokenAbi = require("../abi/erc20token.json");
const user_wallet = require("../user_wallet.json");
fs = require("fs");

getHolder = async () => {
    await getApi(0, 26024419); //26024907
};

getApi = async (fromBlock, toBlock) => {
    const url = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${'0xDb821BB482cfDae5D3B1A48EeaD8d2F74678D593'}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=${range}&sort=asc&apikey=${api_key}`;
    // const url = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&topic0=0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925&topic0_2_opr=and&topic2=${swapXContract[5]}&apikey=${api_key}`;
    const response = await fetch(url);
    console.log(url);
    try {
        const body = JSON.parse(await response.text());
        console.log(body.result.length);
        const lastBlock = parseInt(
            body.result[body.result.length - 1].blockNumber,
            10,
        );
        await saveData(body.result, lastBlock);
    } catch (error) {
        console.log(error, { fromBlock, toBlock });
        getApi(fromBlock, toBlock);
    }
};

const checkContract = async () => {
    console.log("checkContract");
    let holder = await Wallet.find({});
    console.log(holder.length);
    for (let i = 287414; i < holder.length; i++) {
        if (
            holder[i].block1 == holder[i].block2 &&
            holder[i].block2 == holder[i].block3 &&
            holder[i].block1 == "0"
        )
            continue;
        console.log(i, "/", holder.length);
        console.log(i, holder[i].contract);
        if (holder[i].contract == "user" || holder[i].contract == "contract")
            continue;
        console.log(i, holder[i]);
        if ((await web3Default.eth.getCode(holder[i].address)) == "0x")
            await Wallet.updateOne(
                { address: holder[i].address },
                { contract: "user" },
            );
        else
            await Wallet.updateOne(
                { address: holder.address },
                { contract: "contract" },
            );
    }
};

const checkWalletContract = async () => {
    let result = [];
    for (let i = 0; i < user_wallet.length; i++) {
        console.log(i, "/", user_wallet.length);
        console.log(i, user_wallet[i].address);
        console.log(i, user_wallet[i]);
        if ((await web3Default.eth.getCode(user_wallet[i].address)) == "0x") {
            user_wallet[i].contract = "User";
            result.push(user_wallet[i]);
        } else {
            user_wallet[i].contract = "Contract";
            result.push(user_wallet[i]);
        }
    }
    let data = JSON.stringify(result);
    await fs.writeFileSync("user_wallet_data.json", data, (error) => {});
};

const getTx = async () => {
    // let tx = await web3Default.eth.getTransaction('0x44d4c8f3c9238d91fdfbc93ed2f472004e65a4e3d71a0ae9b7ed0014ec4f374e');
    // console.log(tx)
    // return
    let data = await BottomFishing.find().lean();
    if (data.length == 0) process.exit();
    for (let i = 0; i < data.length; i++) {
        let tx;
        try {
            tx = await web3Default.eth.getTransactionReceipt(data[i].tx_hash);
        } catch (error) {
            console.log(error);
        }
        let t = 0
        console.log(i + 1, "/", data.length);
        console.log(data[i].tx_hash);
        for (let log of tx.logs) {
            if (
                log.topics[0] ==
                "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
            ) {
                t = 1;
            }
        }
        console.log(tx.blockNumber)
        if (t == 0) {
            await BottomFishing.updateOne(
                { _id: data[i]._id },
                {
                    tx_origin: tx.from,
                    transfer: true,
                    blocknumber: tx.blockNumber,
                },
            );
        }

        if (t == 1) {
            await BottomFishing.updateOne(
                { _id: data[i]._id },
                {
                    tx_origin: tx.from,
                    transfer: false,
                    blocknumber: tx.blockNumber,
                },
            );
        }
        // if (!tx) continue
        // if (data[i].owner == tx.from) {
        //     // console.log(tx)
        //     // console.log(data[i])
        //     await HackedData.deleteOne({_id: data[i]._id});
        //     continue;
        // }
        // await HackedData.updateOne({_id: data[i]._id}, {tx_origin: tx.from})
    }
    // getTx();
};

const getTxInfo = async () => {
    let data = await BottomFishing.find().lean();
    let symbol;
    let decimal;
    let contract;
    for (let i = 0; i < data.length; i++) {
        if (i == 0 || data[i].address !== data[i - 1].address) {
            contract = new web3Default.eth.Contract(tokenAbi, data[i].address);
            console.log("contract");
            symbol = await contract.methods.symbol().call();
            decimal = await contract.methods.decimals().call();
        }
        console.log(i + 1, "/", data.length, symbol, decimal);
        await HackedData.updateOne(
            { _id: data[i]._id },
            {
                symbol,
                decimal,
            },
        );
    }
};

saveData = async (data, lastBlock) => {
    console.log("saving data...");
    let continueBlock = parseInt(data[data.length - 1].blockNumber) + 1;
    for (let i = 0; i < data.length - 1; i++) {
        if (data.length == range && data[i].blockNumber == lastBlock) {
            continueBlock = parseInt(data[data.length - 1].blockNumber);
            continue;
        }

        const { from, to, value } = data[i];

        const fromWallet = await Lp.findOne({ address: from }).lean();
        const toWallet = await Lp.findOne({ address: to }).lean();

        let fromBalance, toBalance;
        if (!fromWallet) fromBalance = bn("0").sub(value);
        if (!toWallet) toBalance = bn("0").add(value);

        if (fromWallet) fromBalance = bn(fromWallet.block1).sub(value);
        if (toWallet) toBalance = bn(toWallet.block3).add(value);

        await Lp.updateOne(
            { address: from },
            { block1: fromBalance, block2: fromBalance, block3: fromBalance },
            { upsert: true },
        );
        await Lp.updateOne(
            { address: to },
            { block1: toBalance, block2: toBalance, block3: toBalance },
            { upsert: true },
        );
    }
    console.log("data saved!");
    if (data.length < range) {
        process.exit();
    }
    console.log("continue form ", continueBlock);
    getApi(continueBlock, 26024419);
};

// saveData = async (data, lastBlock) => {
//     console.log("saving data...");
//     let continueBlock = lastBlock + 1;
//     for (let i = 0; i < data.length; i++) {
//         if (data.length == range && data[i].blockNumber == lastBlock) {
//             continueBlock = lastBlock;
//             continue;
//         }
//         let owner = Web3.utils.toChecksumAddress(
//             "0x" + data[i].topics[1].slice(26),
//         );
//         let spender = Web3.utils.toChecksumAddress(
//             "0x" + data[i].topics[2].slice(26),
//         );
//         await HackedData.create({
//             tx_hash: data[i].transactionHash,
//             address: Web3.utils.toChecksumAddress(data[i].address),
//             owner,
//             spender,
//         });
//     }
//     console.log("data saved!");
//     if (data.length < range) {
//         process.exit();
//     }
//     getApi(continueBlock, 26423466);
// };

// const saveData = async (data, lastBlock) => {
//     console.log("saving data...");
//     let continueBlock = lastBlock ;
//     // for (let i = 0; i < data.length; i++) {
//     //     await BottomFishing.create({
//     //         tx_hash: data[i].hash,
//     //         tx_origin: Web3.utils.toChecksumAddress(data[i].address),
//     //         from: data[i].from,
//     //         to: data[i].to,
//     //         amount: data[i].value,
//     //     });
//     // }
//     console.log("data saved!");
//     if (data.length < range) {
//         process.exit();
//     }
//     getApi(continueBlock, 26024907);
// };

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

getPrice = async () => {
    // await HackedData.updateMany({address: '0x55d398326f99059fF775485246999027B3197955'}, {price: '1'})
    let data = await BottomFishing.find({});
    let price;
    console.log(data.length);
    for (let i = 0; i < data.length; i++) {
        if (data[i].transfer == true) continue;
        if (i == 0 || data[i].blocknumber != data[i-1].blocknumber) {
            const url = `https://deep-index.moralis.io/api/v2/erc20/${lz_address}/price?chain=0x38&exchange=pancakeswap-v2&to_block=${data[i].blocknumber}`;
            const response = await fetch(url, {
                headers: {
                    "X-API-Key":
                        "qeUyWwmLBcvP6c8Ad5iLkeZk8qsJ3A7VOw12iVwsFtiEK3zXRcoY4INrTjwQh5pl",
                },
            });
            console.log(url);
            const body = JSON.parse(await response.text());
            price = body.usdPrice;
        }
        console.log(i);
        console.log("PRICE", price);
        await BottomFishing.updateOne({ _id: data[i]._id }, { price });
    }
};

module.exports = {
    getHolder,
    calculateBalance,
    getTx,
    getTxInfo,
    getPrice,
    checkContract,
    checkWalletContract,
};
