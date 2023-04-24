const fetch = require("node-fetch");
const { ethers } = require("ethers");
const bn = ethers.BigNumber.from;

let userSwapData = [];
const moralis_api_key =
  "h8W3Cec6jECRLzi6LxW7rKCTxS2DPiPrDjBIwopqF41Y9A7nn53Zq58VMA8oY9uH";
const wallet_address = "0xe97e438826bc42a04a32e6d89576705135d96e12";
const contract_address = "0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae";

async function userSwap() {
  // const wallet_address = "0x3e0d064e079f93b3ed7a023557fc9716bcbb20ae";
  let cursor = null;
  try {
    await getAPIs(cursor);
  } catch (error) {
    console.log("error", error);
  }
}

async function getAPIs(cursor) {
  const headers = {
    "X-API-Key": moralis_api_key,
  };
  const url = `https://deep-index.moralis.io/api/v2/erc20/transfers?chain=bsc&wallet_addresses%5B0%5D=${wallet_address}&from_block=0&to_block=28710816${
    cursor ? "&cursor=" + cursor : ""
  }`;
  console.log(url);
  const response = await fetch(url, { headers });
  const body = JSON.parse(await response.text());
  userSwapData = userSwapData.concat(body.result);
  if (body.cursor) {
    getAPIs(body.cursor);
    return;
  }
  // console.log("END", userSwapData);
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
        i++;
        continue;
      }
      if (i == 0) continue;
      if (
        userSwapData[i].transaction_hash == userSwapData[i - 1].transaction_hash
      ) {
        results.push([userSwapData[i], userSwapData[i - 1]]);
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
  console.log(results)
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
