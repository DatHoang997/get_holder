const Wallet = require("../models/events");
const Lp = require("../models/lp");
const Tx = require("../models/tx");
const HackedData = require("../models/hacked_data");
const Data = require("../models/data");
const Address = require("../models/address");
const data = require("../data.json");
const Web3 = require("web3");
const fetch = require("node-fetch");
const coingecko = require("../coingecko.json");
const {
  swapXContract,
  range,
  bn,
  api_key,
  lz_address,
  wallet_address,
  contract_address,
} = require("../util/constant");
const endpoint = "https://rpc.ankr.com/bsc";
const web3Default = new Web3(endpoint);
const tokenAbi = require("../abi/erc20token.json");
// const user_wallet = require("../user_wallet.json");
fs = require("fs");

getHolder = async () => {
  await getApi(9124420, 26024907); //26024907
};

getApi = async (fromBlock, toBlock) => {
  // const url = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${"0x26585626e4a8d4fc409146b47a61790d9008967c"}&startblock=${fromBlock}&endblock=${toBlock}&page=1&offset=${range}&sort=asc&apikey=${api_key}`;
  const url = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&topic0=0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925&topic0_2_opr=and&topic2=${swapXContract[6]}&apikey=${api_key}`;
  const response = await fetch(url);
  console.log(url);
  try {
    const body = JSON.parse(await response.text());
    console.log(body.result);
    // const lastBlock = parseInt(
    //   body.result[body.result.length - 1].blockNumber,
    //   16,
    // );
    // await saveData(body.result, lastBlock, toBlock);
  } catch (error) {
    console.log(error, { fromBlock, toBlock });
    // getApi(fromBlock, toBlock);
  }
};

const checkContract = async () => {
  console.log("checkContract");
  let holder = await Address.find({});
  for (let i = 109; i < holder.length; i++) {
    console.log(i, "/", holder.length);
    if ((await web3Default.eth.getCode(holder[i].address)) == "0x") {
      await Address.updateOne(
        { address: holder[i].address },
        { contract: "user" },
      );
    } else {
      console.log("else");
      await Address.updateOne(
        { address: holder[i].address },
        { contract: "contract" },
      );
    }
  }
};

const checkWalletContract = async () => {
  for (let i = 0; i < data.length; i++) {
    await Address.insertMany({ address: data[i] });
  }
};

const getTx = async () => {
  // let tx = await web3Default.eth.getTransactionReceipt('0xb40107326fd7dece4fc619eaa459e34408e465f9ccdce9e7b09a7ab73388a1af');
  // console.log(tx.logs[41])
  // return
  let data = await HackedData.find().lean();
  console.log(data.length);
  if (data.length == 0) process.exit();
  for (let i = 0; i < data.length; i++) {
    let tx;
    try {
      tx = await web3Default.eth.getTransactionReceipt(data[i].tx_hash);
    } catch (error) {
      console.log(error);
      getTx();
    }
    // console.log(tx)
    // process.exit()
    console.log(i + 1, "/", data.length);
    console.log(data[i].tx_hash, tx.from, data[i].owner.toLowerCase());
    if (tx.from == data[i].owner.toLowerCase()) {
      await HackedData.deleteOne({ _id: data[i]._id });
    }
    for (let log of tx.logs) {
      if (
        log.topics[0] ==
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
        log.topics[1] ==
          "0x000000000000000000000000" + data[i].owner.toLowerCase().slice(2) &&
        log.topics[2] ==
          "0x000000000000000000000000" + data[i].spender.toLowerCase().slice(2)
      ) {
        let amount = parseInt(log.data, 16);
        await HackedData.updateOne(
          { _id: data[i]._id },
          {
            tx_origin: tx.from,
            blocknumber: tx.blockNumber,
            amount,
          },
        );
      }
    }
  }
};

const getTo = async () => {
  let to;
  for (let i = 0; i < data.length; i++) {
    if (i != 0 && data[i] != data[i - 1]) {
      let tx = await web3Default.eth.getTransaction(data[i]);
      to = tx.to;
      console.log(i, data[i], to);
      Tx.insertMany({ tx_hash: data[i], to: tx.to });
    } else {
      Tx.insertMany({ tx_hash: data[i], to: to });
    }
  }
};

const getTxInfo = async () => {
  let data = await HackedData.find().lean();
  let symbol;
  let decimal;
  let contract;
  for (let i = 0; i < data.length; i++) {
    if (i == 0 || data[i].address !== data[i - 1].address) {
      contract = new web3Default.eth.Contract(tokenAbi, data[i].address);
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

saveData = async (data, lastBlock, toBlock) => {
  console.log("saving data...");
  let continueBlock = parseInt(data[data.length - 1].blockNumber) + 1;
  for (let i = 0; i < data.length - 1; i++) {
    if (data.length == range && data[i].blockNumber == lastBlock) {
      continueBlock = parseInt(data[data.length - 1].blockNumber);
      continue;
    }
    const { from, to, value } = data[i];
    if (from == to) continue;
    const fromWallet = await Lp.findOne({ address: from }).lean();
    const toWallet = await Lp.findOne({ address: to }).lean();

    let fromBalance, toBalance;
    if (!fromWallet) fromBalance = bn("0").sub(value);
    if (!toWallet) toBalance = bn("0").add(value);

    if (fromWallet) fromBalance = bn(fromWallet.block3).sub(value);
    if (toWallet) toBalance = bn(toWallet.block3).add(value);

    await Lp.updateOne(
      { address: from },
      { block3: fromBalance },
      { upsert: true },
    );
    await Lp.updateOne(
      { address: to },
      { block3: toBalance },
      { upsert: true },
    );
  }
  console.log("data saved!");
  if (data.length < range) {
    process.exit();
  }
  console.log("continue form ", continueBlock);
  getApi(continueBlock, toBlock);
};

// saveData = async (data, lastBlock, toBlock) => {
//   console.log("saving data...");
//   let continueBlock = lastBlock + 1;
//   for (let i = 0; i < data.length; i++) {
//     if (data.length == range && data[i].blockNumber == lastBlock) {
//       continueBlock = lastBlock;
//       continue;
//     }
//     let owner = Web3.utils.toChecksumAddress(
//       "0x" + data[i].topics[1].slice(26),
//     );
//     let spender = Web3.utils.toChecksumAddress(
//       "0x" + data[i].topics[2].slice(26),
//     );
//     await HackedData.create({
//       tx_hash: data[i].transactionHash,
//       address: Web3.utils.toChecksumAddress(data[i].address),
//       owner,
//       spender,
//     });
//   }
//   console.log("data saved!");
//   if (data.length < range) {
//     process.exit();
//   }
//   getApi(continueBlock, toBlock);
// };

// const saveData = async (data, lastBlock, toBlock) => {
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
//     getApi(continueBlock, toBlock);
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
  // await HackedData.updateMany({symbol: 'BUSD'}, {price0: '1', price1: '1'})
  // await HackedData.updateMany({symbol: 'USDT'}, {price0: '1', price1: '1'})
  // return
  let data = await HackedData.find({});
  let price;
  console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    if (data[i].symbol == "USDT" || data[i].symbol == "BUSD") {
      continue;
    }
    console.log(data[i]);
    const url = `https://deep-index.moralis.io/api/v2/erc20/${data[i].address}/price?chain=0x38&exchange=pancakeswap-v2&to_block=${data[i].blockNumber}`;
    const response = await fetch(url, {
      headers: {
        "X-API-Key":
          "qeUyWwmLBcvP6c8Ad5iLkeZk8qsJ3A7VOw12iVwsFtiEK3zXRcoY4INrTjwQh5pl",
      },
    });
    console.log(url);
    const body = JSON.parse(await response.text());
    price = body.usdPrice;

    console.log(i);
    console.log("PRICE", price);
    await HackedData.updateOne({ _id: data[i]._id }, { price1: price });
  }
};

async function format() {
  let results = [];
  for (let i = 0; i < coingecko.length; i++) {
    let platforms = Object.values(coingecko[i].platforms);
    if (platforms.length == 0) continue;
    for (let j = 0; j < platforms.length; j++) {
      let data = {
        id: coingecko[i].id,
        token: platforms[j],
      };
      results.push(data);
    }
  }
  let result = JSON.stringify(results);
  await fs.writeFileSync("newCoingecko.json", result, (error) => {});
  process.exit();
}
let userSwapData = [];
async function userSwap() {
  // const wallet_address = "0x4b02873EC91D6763557FB36aA847B340e580930b";
  const wallet_address = "0xf143390c89c10b4875de529b2c53ebf344b346eb";
  const contract_address = "0x6fe9e9de56356f7edbfcbb29fab7cd69471a4869";
  let cursor = null;
  try {
    await getAPIs(wallet_address, cursor, contract_address);
  } catch (error) {
    console.log("error", error);
  }
}

async function getAPIs(wallet_address, cursor, contract_address) {
  const api_key =
    "h8W3Cec6jECRLzi6LxW7rKCTxS2DPiPrDjBIwopqF41Y9A7nn53Zq58VMA8oY9uH";
  const headers = {
    "X-API-Key": api_key,
  };
  const url = `https://deep-index.moralis.io/api/v2/erc20/transfers?chain=bsc&wallet_addresses%5B0%5D=${wallet_address}&from_block=0&to_block=28710816${
    cursor ? "&cursor=" + cursor : ""
  }`;
  const response = await fetch(url, { headers });
  const body = JSON.parse(await response.text());
  userSwapData = userSwapData.concat(body.result);
  if (body.cursor) {
    getAPIs(wallet_address, body.cursor);
    return;
  }
  console.log("END", userSwapData.length);
  pairSwap(contract_address);
  return;
}

async function pairSwap(contract_address) {
  let results = [];
  for (let i = 1; i < userSwapData.length; i++) {
    if (
      userSwapData[i].from_wallet == contract_address ||
      userSwapData[i].to_wallet == contract_address
    ) {
      if (
        userSwapData[i].transaction_hash == userSwapData[i + 1].transaction_hash
      ) {
        results.push([userSwapData[i], userSwapData[i + 1]]);
        i++
        continue
      }
      if (i == 0) continue
      if (
        userSwapData[i].transaction_hash == userSwapData[i - 1].transaction_hash
      ) {
        results.push([userSwapData[i], userSwapData[i - 1]]);
      }
    }
  }
  console.log(results);
}

module.exports = {
  getHolder,
  calculateBalance,
  getTx,
  getTxInfo,
  getPrice,
  checkContract,
  checkWalletContract,
  getTo,
  format,
  userSwap,
};
