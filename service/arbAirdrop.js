const fetch = require("node-fetch");
const range = 1000;
fs = require("fs");
let savingData = [];

const getWallet = async () => {
  await getApi(0, 84064042); //26024907
};

const getApi = async (fromBlock, toBlock) => {
  const url = `https://api.arbiscan.io/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=0x67a24ce4321ab3af51c2d0a4801c3e111d88c9d9&topic0=0x87aeeb9eda09a064caef63d00f62c15063631980bfc422ad7dd30c8a79f0cbb7&apikey=G4UZWDHIR33H59QNXBQF8IR6XQSD521BGV`;
  const response = await fetch(url);
  console.log(url);
  try {
    const body = JSON.parse(await response.text());
    const lastBlock = parseInt(
      body.result[body.result.length - 1].blockNumber,
      16,
    );
    await saveData(body.result, lastBlock, toBlock);
  } catch (error) {
    console.log(error, { fromBlock, toBlock });
    getApi(fromBlock, toBlock);
  }
};

saveData = async (data, lastBlock, toBlock) => {
  console.log("saving data...");
  let continueBlock = parseInt(data[data.length - 1].blockNumber) + 1;
  let x = false;
  if (data[0].blockNumber == data[data.length - 1].blockNumber) {
    x = true;
  }
  for (let i = 0; i < data.length - 1; i++) {
    if (data.length == range && data[i].blockNumber == lastBlock && !x) {
      continueBlock = parseInt(data[data.length - 1].blockNumber);
      continue;
    }
    const address = data[i].topics[1].slice(0, 2) + data[i].topics[1].slice(25);
    const amount = parseInt(data[i].data, 16);
    console.log({ address, amount });
    savingData.push({ address, amount });
  }

  console.log("data saved!");
  if (data.length < range) {
    let config = JSON.stringify(savingData);
    await fs.writeFileSync("arb.json", config, (error) => {});
    process.exit();
  }
  console.log("continue form ", continueBlock);
  getApi(continueBlock, toBlock);
};
module.exports = {
  getWallet,
};
