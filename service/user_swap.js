const fetch = require("node-fetch");

let userSwapData = [];
const moralis_api_key = "h8W3Cec6jECRLzi6LxW7rKCTxS2DPiPrDjBIwopqF41Y9A7nn53Zq58VMA8oY9uH";
const wallet_address = "0x4b02873EC91D6763557FB36aA847B340e580930b";
const contract_address = "0x2d518fdcc1c8e89b1abc6ed73b887e12e61f06de";

async function userSwap() {
  // const wallet_address = "0x3e0d064e079f93b3ed7a023557fc9716bcbb20ae";
  let cursor = null;
  try {
    await getAPIs( cursor);
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
  console.log(url)
  const response = await fetch(url, { headers });
  const body = JSON.parse(await response.text());
  userSwapData = userSwapData.concat(body.result);
  if (body.cursor) {
    getAPIs(body.cursor);
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
  userSwap,
};