const Wallet = require("./models/events");
const Web3 = require("web3");
const fetch = require("node-fetch");
const { ethers } = require("ethers");

const lz_address = "0x3b78458981eb7260d1f781cb8be2caac7027dbe2";
const api_key = "VSUEYZSSBWGFSMZ9XU1RECMWZWVMQ4R3G9";
const bn = ethers.BigNumber.from;

getHolder = async () => {
    await getApi(26024421, 26024908);
    return;
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
        const saveBlock = body.result[body.result.length - 1].blockNumber;
        saveData(body.result, saveBlock);
    } catch (error) {
        console.log(error, { fromBlock, toBlock });
        getApi(fromBlock, toBlock);
    }
};

saveData = async (data, saveBlock) => {
    console.log("saving data...");

    for (let i = 0; i < data.length - 1; i++) {
        if (data[i].blockNumber == saveBlock) continue;
        const { from, to, value } = data[i];

        //     const objAdress={};

        //     for(const i of addresss){
        //         objAdress[i.address]=i;
        // }

        // const fromWallet = addresss.find((i) => i.address === from);
        // const toWallet = addresss.find((i) => i.address === to);
        const fromWallet = await Wallet.findOne({ address: from }).lean();
        const toWallet = await Wallet.findOne({ address: to }).lean();

        let fromBalance, toBalance;
        if (!fromWallet) fromBalance = bn("0").sub(value);
        if (!toWallet) toBalance = bn("0").add(value);

        if (fromWallet) fromBalance = bn(fromWallet.block3).sub(value);
        if (toWallet) toBalance = bn(toWallet.block3).add(value);

        if (from == "0xf5dfc6b02016e6cdf504c9d998dc89ef2ab75cbc") {
            console.log(fromBalance.toString());
        }
        if (to == "0xf5dfc6b02016e6cdf504c9d998dc89ef2ab75cbc") {
            console.log(toBalance.toString());
        }
        await Wallet.updateOne(
            { address: from },
            { block3: fromBalance },
            { upsert: true },
        );
        await Wallet.updateOne(
            { address: to },
            { block3: toBalance },
            { upsert: true },
        );
    }
    console.log("data saved!");
    if (data.length < 10000) {
        process.exit();
    }
    getApi(parseInt(data[data.length - 1].blockNumber), 26024419);
};

module.exports = {
    getHolder,
};
