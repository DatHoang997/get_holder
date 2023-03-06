const Wallet = require("./models/events");
const Web3 = require("web3");
const fetch = require("node-fetch");

const lz_address = "0x3B78458981eB7260d1f781cb8be2CaAC7027DbE2";
const api_key = "VSUEYZSSBWGFSMZ9XU1RECMWZWVMQ4R3G9";

getHolder = async () => {
    await getApi(26023452, 27024419);
    return
};

getApi = async (fromBlock, toBlock) => {
    const response = await fetch(
        `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${lz_address}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=10000&sort=asc&apikey=${api_key}`,
    );
    console.log(`https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${lz_address}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=10000&sort=asc&apikey=${api_key}`)
    try {
        const body = JSON.parse(await response.text());
        if(body.result.length == 0) {
            process.exit()
        }
        saveData(body.result);
    } catch (error) {
        console.log(error, {fromBlock, toBlock})
        getApi(fromBlock, toBlock)
    }
};

saveData = async (data) => {
    console.log('saving data...')
    let task = [];
    for (let i = 0; i < data.length-1; i++) {
        const { from, to, value } = data[i];
        const _value = +Web3.utils.fromWei(value, "ether");

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
    }
    await Wallet.bulkWrite(task);
    console.log('data saved!')
    getApi(parseInt(data[data.length-1].blockNumber), 26024419)
}

module.exports = {
    getHolder,
};
