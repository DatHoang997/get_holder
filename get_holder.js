const Wallet = require("./models/events");
const Web3 = require("web3");
const ethers = require("ethers");
const lzPoolInterface = new ethers.Interface(require("./abi/lzPool.json"));
const https = require("https");
const fetch = require("node-fetch");
const lzPool = require("./abi/lzPool.json");
const { takeCoverage } = require("v8");
const { format } = require("path");
const newProvider = new Web3(
    "https://bsc-mainnet.nodereal.io/v1/eb8693749b3e481781d8ab685c3b9c3c",
);

const lz_address = "0x3B78458981eB7260d1f781cb8be2CaAC7027DbE2";
const api_key = "VSUEYZSSBWGFSMZ9XU1RECMWZWVMQ4R3G9";
// let url = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${lz_address}&startblock=${startBlock}&endblock=${startBlock}&page=1&offset=10000&sort=asc&apikey=VSUEYZSSBWGFSMZ9XU1RECMWZWVMQ4R3G9`;
getHolder = async (provider) => {
    // let lz = new ethers.Contract(lz_address, lzPool, newProvider)
    // console.log(lz.eth.call())
    let data = await getApi(9345340, 9481531);
    let task = [];

    for (let i = 0; i < data.length; i++) {
        // let from = await Wallet.findOne(data.from);
        // let to = await Wallet.findOne(data.to);
        const { from, to, value } = data[i];

     //   console.log(Web3.utils.fromWei(value.substring(0, 18), "ether"));
        const _value = +Web3.utils.fromWei(value.substring(0, 18), "ether");
        if(from=="0xdad254728a37d1e80c21afae688c64d0383cc307" || to =="0xdad254728a37d1e80c21afae688c64d0383cc307")
        {
            console.log({ from, to, _value });
        }

        task.push(
            {
                updateOne: {
                    filter: {
                        address: to,
                    },
                    update: {
                        $inc: {
                            value: _value,
                        },
                        value_tring
                    },
                    upsert: true,
                },
            },
            {
                updateOne: {
                    filter: {
                        address: from,
                    },
                    update: {
                        $inc: {
                            value: -_value,
                        },
                    },
                    upsert: true,
                },
            },
        );

        if (task.length == 100) {
            await Wallet.bulkWrite(task);
            task = [];
        }

        // await Promise.all([
        //     Wallet.findOneAndUpdate({address:from},{$inc:-(_value)},{upsert:true}),
        //     Wallet.findOneAndUpdate({address:to},{$inc:(_value)},{upsert:true})
        // ])

        // if (!from) {
        //     Wallet
        // }
        // if (from) {
        //     let fromBlance = from.balance - value;
        //     Wallet.updateOne({ address: data.from }, { balance: fromBlance });
        // }
        // if (to) {
        //     let fromBlance = from.balance + value;
        //     Wallet.updateOne({ address: data.from }, { balance: toBlance });
        // }
    }
    await Wallet.bulkWrite(task);

    // let data = getApi(9345340, 26024419);
    // 3382
    // const filter = {
    //     address: "0x3b78458981eb7260d1f781cb8be2caac7027dbe2",
    //     // fromBlock: 9345340,
    //     fromBlock: 25011420,
    //     toBlock: 26024420,
    //     topics: [
    //         "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    //     ],
    // };

    // let result = await provider.getLogs(filter);
    // console.log(result.length)
    // for (let i = 0; i < result.length; i++) {
    //     decode(result[i]);
    // }
    // console.log("@@@", result.blockHash);
    // let wallets = new eventModel({
    //     wallet: result.blockHash,
    // });
    // wallets.save();
};
// const options = {
//     hostname: `https://api.chainbase.online/v1/token/holders?chain_id=56&contract_address=0x3b78458981eb7260d1f781cb8be2caac7027dbe2&to_block=26024419&page=${page}&limit=100`,
//     path: "/get",
//     headers: {
//         'x-api-key': "demo",
//     },
// };
// `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${lz_address}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=10000&sort=asc&apikey=VSUEYZSSBWGFSMZ9XU1RECMWZWVMQ4R3G9`
// https://api.chainbase.online/v1/token/holders?chain_id=56&contract_address=0x3b78458981eb7260d1f781cb8be2caac7027dbe2&to_block=26024419&page=2&limit=100

getApi = async (fromBlock, toBlock) => {
    const response = await fetch(
        `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${lz_address}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=10000&sort=asc&apikey=VSUEYZSSBWGFSMZ9XU1RECMWZWVMQ4R3G9`,
    );
    const body = JSON.parse(await response.text());
    return body.result;
};

decode = (log) => {
    try {
        let result = lzPoolInterface.decodeEventLog(
            "Transfer",
            log.data,
            log.topics,
        );
        // console.log('@@@', result)
    } catch (error) {}
};

module.exports = {
    getHolder,
};
