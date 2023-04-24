const fetch = require("node-fetch");
const { ethers } = require("ethers");
const bn = ethers.BigNumber.from;

let userSwapData = [];
const moralis_api_key =
  "h8W3Cec6jECRLzi6LxW7rKCTxS2DPiPrDjBIwopqF41Y9A7nn53Zq58VMA8oY9uH";
const wallet_address = "0xbe8784E13d95020Ad182af4Ca1560287b493AAF9";
const contract_address = "0x400d7f19ca189762d7944a62ea351db8de54f571";
const chain = 'arbitrum';
//bsc arbitrum

async function userSwap() {
  let cursor = null;
  try {
    await getAPIs(cursor);
  } catch (error) {
    console.log("error", error);
  }
}
async function getNavtive(data) {
  const headers = {
    "X-API-Key": moralis_api_key,
  };
  const url = `https://deep-index.moralis.io/api/v2/transaction/${data.transaction_hash}/verbose?chain=${chain}`;
  console.log(url);
  let nativeData = [];
  const response = await fetch(url, { headers });
  const body = await response.json();
  for (let log of body.logs) {
    if (
      log.topic2 != null &&
      log.topic1 ==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      nativeData = [
        {
          contract_address: log.address,
          value: log.transaction_value,
        },
        data,
      ];
    }
    if (
      log.topic1 != null &&
      log.topic2 ==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      nativeData = [
        data,
        {
          contract_address: log.address,
          value: log.transaction_value,
        },
      ];
    }
  }
  return nativeData;
}

async function getAPIs(cursor) {
  const headers = {
    "X-API-Key": moralis_api_key,
  };
  const url = `https://deep-index.moralis.io/api/v2/erc20/transfers?chain=${chain}&wallet_addresses%5B0%5D=${wallet_address}${
    cursor ? "&cursor=" + cursor : ""
  }`;
  console.log(url);
  const response = await fetch(url, { headers });
  const body = await response.json();
  userSwapData = userSwapData.concat(body.result);
  if (body.cursor) {
    getAPIs(body.cursor);
    return;
  }
  pairSwap();
  return;
}

async function pairSwap() {
  let results = [];
  for (let i = 1; i < userSwapData.length; i++) {
    if (
      userSwapData[i].from_wallet == contract_address ||
      userSwapData[i].to_wallet == contract_address
    ) {
      if (
        userSwapData[i].transaction_hash ==
          userSwapData[i + 1].transaction_hash &&
        userSwapData[i].contract_address != userSwapData[i + 1].contract_address
      ) {
        results.push([userSwapData[i], userSwapData[i + 1]]);
        i++;
        continue;
      }
      if (i == 0) continue;
      if (
        userSwapData[i].transaction_hash ==
          userSwapData[i - 1].transaction_hash &&
        userSwapData[i].contract_address != userSwapData[i - 1].contract_address
      ) {
        results.push([userSwapData[i - 1], userSwapData[i]]);
        continue;
      } else {
        try {
          let native = await getNavtive(userSwapData[i]);
          results.push(native);
        } catch (error) {
          console.log("error", error);
        }
      }
    }
  }
  let amountA = bn(0);
  let amountB = bn(0);
  let amountC = bn(0);
  let amountD = bn(0);
  let tokenA;
  let tokenB;
  for (let i = 0; i < results.length; i++) {
    if (i == 0) {
      tokenA = results[i][0].contract_address;
      tokenB = results[i][1].contract_address;
    }
    if (results[i][0].contract_address == tokenA) {
      amountA = amountA.add(results[i][0].value);
      amountB = amountB.add(results[i][1].value);
    } else {
      amountC = amountC.add(results[i][0].value);
      amountD = amountD.add(results[i][1].value);
    }
  }

  console.log({
    results,
    buy: {
      tokenA,
      amountIn: ethers.utils.formatEther(amountA.toString()),
      tokenB,
      amountOUT: ethers.utils.formatEther(amountB.toString()),
    },
    sell: {
      tokenA,
      amountIN: ethers.utils.formatEther(amountD.toString()),
      tokenB,
      amountOUT: ethers.utils.formatEther(amountC.toString()),
    },
  });
}

module.exports = {
  userSwap,
};
