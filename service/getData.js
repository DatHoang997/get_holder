const Wallet = require("../models/events")
const Lp = require("../models/lp")
const Tx = require("../models/tx")
const HackedData = require("../models/hacked_data")
const Address = require("../models/address")
// const data = require("../data.json")
const Web3 = require("web3")
const { utils } = require("ethers")
const fetch = require("node-fetch")
const {
  swapXContract,
  range,
  bn,
  api_key,
  lz_address,
  wallet_address,
  contract_address,
  moralis_api_key,
} = require("../util/constant")
const endpoint = "https://rpc.ankr.com/bsc"
const web3Default = new Web3(endpoint)
const tokenAbi = require("../abi/erc20token.json")
const DataDb = require("../models/LiquidatePosition")
const update = require("../models/liquidate")
fs = require("fs")

const getData = async () => {
  await getDercrease(0, 40000000) //26024907
}

// 0x93d75d64d1f84fc6f430a64fc578bdd4c1e090e90ea2d51773e626d19de56d30 DecreasePosition
// 0x2fe68525253654c21998f35787a8d0f361905ef647c854092430ab65f2f15022 IncreasePosition
// 0x2e1f85a64a2f22cf2f0c42584e7c919ed4abe8d53675cff0f62bf1e95a1c676f LiquidatePosition
// 0x25e8a331a7394a9f09862048843323b00bdbada258f524f5ce624a45bf00aabb UpdatePosition
// 0x73af1d417d82c240fdb6d319b34ad884487c6bf2845d98980cc52ad9171cb455 ClosePosition

const DecreasePosition =
  "0x93d75d64d1f84fc6f430a64fc578bdd4c1e090e90ea2d51773e626d19de56d30"
const IncreasePosition =
  "0x2fe68525253654c21998f35787a8d0f361905ef647c854092430ab65f2f15022"
const LiquidatePosition =
  "0x2e1f85a64a2f22cf2f0c42584e7c919ed4abe8d53675cff0f62bf1e95a1c676f"

const getDercrease = async (fromBlock, toBlock) => {
  const splitData = []
  let DercreaseData = await getApi(DecreasePosition, fromBlock, toBlock)
  splitData.push(DercreaseData.savingData)
  await wait(100)
  let IncreasedataRaw = await getApi(
    IncreasePosition,
    fromBlock,
    DercreaseData.continueBlock,
  )
  splitData.push(IncreasedataRaw.savingData)
  await wait(100)
  let LiquidatedataRaw = await getApi(
    LiquidatePosition,
    fromBlock,
    DercreaseData.continueBlock,
  )
  splitData.push(LiquidatedataRaw.savingData)
  await wait(100)
  await mergeData(splitData, DercreaseData.continueBlock)
  if (DecreasePosition.stop) process.exit()
  // await getDercrease(continueBlock, toBlock)
}

const getApi = async (topic, fromBlock, toBlock) => {
  const url = `https://api.arbiscan.io/api?module=logs&action=getLogs&topic0=${topic}&fromBlock=${fromBlock}&toBlock=${toBlock}&apikey=${api_key}`
  console.log(url)
  const response = await fetch(url)
  let retries = 0

  while (retries < 100) {
    try {
      const body = JSON.parse(await response.text())
      if (body.status == "0") {
        console.log("FALSE", { url })
      }
      const lastBlock = parseInt(
        body.result[body.result.length - 1].blockNumber,
      )
      return await saveData(body.result, lastBlock, toBlock)
    } catch (error) {
      retries++
      console.log(`FALSE ${url}`)
      await wait(5000)
    }
  }

  process.exit()
}

const saveData = async (data, lastBlock) => {
  let continueBlock = lastBlock - 1
  const savingData = []
  for await (let a of data) {
    if (data.length == range && a.blockNumber == lastBlock) {
      continue
    }
    savingData.push(fomatData(a))
  }
  if (data.length < range) {
    return { continueBlock, savingData, stop: true }
  }
  console.log("continue form ", continueBlock)
  return { continueBlock, savingData, stop: false }
}

const fomatData = (data) => {
  let type

  if (
    data.topics[0] ==
    "0x93d75d64d1f84fc6f430a64fc578bdd4c1e090e90ea2d51773e626d19de56d30"
  )
    type = "DecreasePosition"
  if (
    data.topics[0] ==
    "0x2fe68525253654c21998f35787a8d0f361905ef647c854092430ab65f2f15022"
  )
    type = "IncreasePosition"
  if (
    data.topics[0] ==
    "0x2e1f85a64a2f22cf2f0c42584e7c919ed4abe8d53675cff0f62bf1e95a1c676f"
  )
    type = "LiquidatePosition"

  return {
    type: type,
    txHash: data.transactionHash,
    address: data.address,
    topics: data.topics.toString(),
    data: data.data,
    blockNumber: parseInt(data.blockNumber).toString(),
    timesStamp: parseInt(data.timeStamp).toString(),
  }
}

const mergeData = async (data, lastBlock) => {
  // const slicedString = inputString.substring(40, 64)
  const resultArray = []
  const rawArray = [...data[0], ...data[1], ...data[2]]
    .filter(
      (item) =>
        item.data.slice(218, 258) == "82af49447d8a07e3bd95bd0d56f35241523fbab1",
    )
    .filter((obj) => obj.blockNumber < 2300000)
    .sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber))

  fs = require("fs")
  let ifaceDecrease = new utils.Interface([
    "event DecreasePosition (bytes32 key, address account, address collateralToken, address indexToken, uint256 collateralDelta, uint256 sizeDelta, bool isLong, uint256 price, uint256 fee)",
  ])
  let ifaceIncrease = new utils.Interface([
    "event IncreasePosition (bytes32 key, address account, address collateralToken, address indexToken, uint256 collateralDelta, uint256 sizeDelta, bool isLong, uint256 price, uint256 fee)",
  ])
  let ifaceLiquidate = new utils.Interface([
    "event LiquidatePosition (bytes32 key, address account, address collateralToken, address indexToken, bool isLong, uint256 size, uint256 collateral, uint256 reserveAmount, int256 realisedPnl, uint256 markPrice)",
  ])
  rawArray.forEach((tx) => {
    let iface
    if (tx.type == "DecreasePosition") iface = ifaceDecrease
    if (tx.type == "IncreasePosition") iface = ifaceIncrease
    if (tx.type == "LiquidatePosition") iface = ifaceLiquidate
    const parsedLogs = iface.parseLog({
      topics: [tx.topics],
      data: tx.data,
    })
    resultArray.push({
      type: tx.type,
      key: parsedLogs.args.key,
      account: parsedLogs.args.account,
      collateralToken: parsedLogs.args.collateralToken,
      collateralDelta: parsedLogs.args.collateralDelta
        ? parsedLogs.args.collateralDelta.toString()
        : "null",
      sizeDelta: parsedLogs.args.sizeDelta
        ? parsedLogs.args.sizeDelta.toString()
        : "null",
      isLong: parsedLogs.args.isLong,
      price: parsedLogs.args.price ? parsedLogs.args.price.toString() : "null",
      collateral: parsedLogs.args.collateral
        ? parsedLogs.args.collateral.toString()
        : "null",
      reserveAmount: parsedLogs.args.reserveAmount
        ? parsedLogs.args.reserveAmount.toString()
        : "null",
    })
  })
  let result = JSON.stringify(resultArray)
  await fs.writeFileSync("data.json", result, (error) => {})
  process.exit()
}

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const findKey = async () => {
  const increase = require("../increase.json")
  const update = require("../close.json")
  console.log(update.length)
  const filteredArray = update.filter((obj1) => {
    return increase.some((obj2) => obj2.key === obj1.key)
  })
  console.log(filteredArray.length)
  // fs = require("fs");
  // console.log(data.length)
  let result = JSON.stringify(filteredArray)
  await fs.writeFileSync("closee.json", result, (error) => {})
}

const toJson = async () => {
  let data = await update
    .find(
      { indexToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" },
      {
        _id: 0,
        __v: 0,
      },
    )
    .lean()
  fs = require("fs")
  console.log(data.length)
  let result = JSON.stringify(data)
  await fs.writeFileSync("liquidate.json", result, (error) => {})
}

const decode = async () => {
  let iface = new utils.Interface([
    "event UpdatePosition (bytes32 key, uint256 size, uint256 collateral, uint256 averagePrice, uint256 entryFundingRate, uint256 reserveAmount, int256 realisedPnl)",
  ])
  const logs = await DataDb.find({ blockNumber: { $lt: 2500000 } })
  console.log(logs.length)
  for await (let log of logs) {
    const data = {
      topics: [log.topics],
      data: log.data,
    }
    console.log(log)
    const parsedLogs = iface.parseLog(data)
    const saveData = {
      txHash: log.txHash,
      size: parsedLogs.args.args.size.toString(),
      collateral: parsedLogs.args.args.collateral.toString(),
      leverage: (
        parsedLogs.args.args.size / parsedLogs.args.args.collateral
      ).toString(),
      averagePrice: parsedLogs.args.args.averagePrice.toString(),
      reserveAmount: parsedLogs.args.args.reserveAmount.toString(),
      key: parsedLogs.args.args.key,
      timesStamp: parseInt(log.timesStamp),
    }
    let newUpdate = new update(saveData)
    await newUpdate.save()
    // console.log("@@@@", saveData)
  }
}

const checkContract = async () => {
  let holder = await Address.find({})
  for (let i = 109; i < holder.length; i++) {
    if ((await web3Default.eth.getCode(holder[i].address)) == "0x") {
      await Address.updateOne(
        { address: holder[i].address },
        { contract: "user" },
      )
    } else {
      await Address.updateOne(
        { address: holder[i].address },
        { contract: "contract" },
      )
    }
  }
}

const checkWalletContract = async () => {
  for (let i = 0; i < data.length; i++) {
    await Address.insertMany({ address: data[i] })
  }
}

const getTx = async () => {
  // let tx = await web3Default.eth.getTransactionReceipt('0xb40107326fd7dece4fc619eaa459e34408e465f9ccdce9e7b09a7ab73388a1af');
  // return
  let data = await HackedData.find().lean()
  if (data.length == 0) process.exit()
  for (let i = 0; i < data.length; i++) {
    let tx
    try {
      tx = await web3Default.eth.getTransactionReceipt(data[i].tx_hash)
    } catch (error) {
      console.log(error)
      getTx()
    }
    if (tx.from == data[i].owner.toLowerCase()) {
      await HackedData.deleteOne({ _id: data[i]._id })
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
        let amount = parseInt(log.data, 16)
        await HackedData.updateOne(
          { _id: data[i]._id },
          {
            tx_origin: tx.from,
            blocknumber: tx.blockNumber,
            amount,
          },
        )
      }
    }
  }
}

const getTo = async () => {
  let to
  for (let i = 0; i < data.length; i++) {
    if (i != 0 && data[i] != data[i - 1]) {
      let tx = await web3Default.eth.getTransaction(data[i])
      to = tx.to
      Tx.insertMany({ tx_hash: data[i], to: tx.to })
    } else {
      Tx.insertMany({ tx_hash: data[i], to: to })
    }
  }
}

const getTxInfo = async () => {
  let data = await HackedData.find().lean()
  let symbol
  let decimal
  let contract
  for (let i = 0; i < data.length; i++) {
    if (i == 0 || data[i].address !== data[i - 1].address) {
      contract = new web3Default.eth.Contract(tokenAbi, data[i].address)
      symbol = await contract.methods.symbol().call()
      decimal = await contract.methods.decimals().call()
    }
    await HackedData.updateOne(
      { _id: data[i]._id },
      {
        symbol,
        decimal,
      },
    )
  }
}

const calculateBalance = async () => {
  const data = await Data.find().lean()
  let i = 0
  for (let doc of data) {
    const { from, to, value, blockNumber } = doc
    if (from == to) continue
    const fromWallet = await Wallet.findOne({ address: from }).lean()
    const toWallet = await Wallet.findOne({ address: to }).lean()
    let fromBalance, toBalance
    if (!fromWallet) fromBalance = bn("0").sub(value)
    if (!toWallet) toBalance = bn("0").add(value)

    if (fromWallet) fromBalance = bn(fromWallet.block3).sub(value)
    if (toWallet) toBalance = bn(toWallet.block3).add(value)
    if (parseInt(blockNumber) <= 26024419) {
      await Wallet.updateOne(
        { address: from },
        {
          block1: fromBalance,
          block2: fromBalance,
          block3: fromBalance,
        },
        { upsert: true },
      )
      await Wallet.updateOne(
        { address: to },
        { block1: toBalance, block2: toBalance, block3: toBalance },
        { upsert: true },
      )
    }

    if (parseInt(blockNumber) <= 26024420) {
      await Wallet.updateOne(
        { address: from },
        {
          block2: fromBalance,
          block3: fromBalance,
        },
        { upsert: true },
      )
      await Wallet.updateOne(
        { address: to },
        { block2: toBalance, block3: toBalance },
        { upsert: true },
      )
    }
    if (parseInt(blockNumber) > 26024420) {
      await Wallet.updateOne(
        { address: from },
        {
          block3: fromBalance,
        },
        { upsert: true },
      )
      await Wallet.updateOne(
        { address: to },
        { block3: toBalance },
        { upsert: true },
      )
    }
    i++
  }
  console.log("done")
  process.exit()
}

getPrice = async () => {
  // await HackedData.updateMany({symbol: 'BUSD'}, {price0: '1', price1: '1'})
  // await HackedData.updateMany({symbol: 'USDT'}, {price0: '1', price1: '1'})
  // return
  let data = await HackedData.find({})
  let price
  for (let i = 0; i < data.length; i++) {
    if (data[i].symbol == "USDT" || data[i].symbol == "BUSD") {
      continue
    }
    const url = `https://deep-index.moralis.io/api/v2/erc20/${data[i].address}/price?chain=0x38&exchange=pancakeswap-v2&to_block=${data[i].blockNumber}`
    const response = await fetch(url, {
      headers: {
        "X-API-Key":
          "qeUyWwmLBcvP6c8Ad5iLkeZk8qsJ3A7VOw12iVwsFtiEK3zXRcoY4INrTjwQh5pl",
      },
    })
    const body = JSON.parse(await response.text())
    price = body.usdPrice

    await HackedData.updateOne({ _id: data[i]._id }, { price1: price })
  }
}

async function format() {
  let results = []
  for (let i = 0; i < coingecko.length; i++) {
    let platforms = Object.values(coingecko[i].platforms)
    if (platforms.length == 0) continue
    for (let j = 0; j < platforms.length; j++) {
      let data = {
        id: coingecko[i].id,
        token: platforms[j],
      }
      results.push(data)
    }
  }
  let result = JSON.stringify(results)
  await fs.writeFileSync("newCoingecko.json", result, (error) => {})
  process.exit()
}
let userSwapData = []
async function userSwap() {
  const wallet_address = "0x4b02873EC91D6763557FB36aA847B340e580930b"
  // const wallet_address = "0x3e0d064e079f93b3ed7a023557fc9716bcbb20ae";
  const contract_address = "0x2d518fdcc1c8e89b1abc6ed73b887e12e61f06de"
  let cursor = null
  try {
    await getAPIs(wallet_address, cursor, contract_address)
  } catch (error) {
    console.log("error", error)
  }
}

async function getAPIs(wallet_address, cursor, contract_address) {
  const headers = {
    "X-API-Key": moralis_api_key,
  }
  const url = `https://deep-index.moralis.io/api/v2/erc20/transfers?chain=bsc&wallet_addresses%5B0%5D=${wallet_address}&from_block=0&to_block=28710816${
    cursor ? "&cursor=" + cursor : ""
  }`
  const response = await fetch(url, { headers })
  const body = JSON.parse(await response.text())
  userSwapData = userSwapData.concat(body.result)
  if (body.cursor) {
    getAPIs(wallet_address, body.cursor)
    return
  }
  pairSwap(contract_address)
  return
}

async function pairSwap(contract_address) {
  let results = []
  for (let i = 1; i < userSwapData.length; i++) {
    if (
      userSwapData[i].from_wallet == contract_address ||
      userSwapData[i].to_wallet == contract_address
    ) {
      if (
        userSwapData[i].transaction_hash == userSwapData[i + 1].transaction_hash
      ) {
        results.push([userSwapData[i], userSwapData[i + 1]])
        i++
        continue
      }
      if (i == 0) continue
      if (
        userSwapData[i].transaction_hash == userSwapData[i - 1].transaction_hash
      ) {
        results.push([userSwapData[i], userSwapData[i - 1]])
      }
    }
  }
}

module.exports = {
  getData,
}
