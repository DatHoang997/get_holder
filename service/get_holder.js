const Wallet = require("../models/events")
const Lp = require("../models/lp")
const Tx = require("../models/tx")
const HackedData = require("../models/hacked_data")
const Address = require("../models/address")
// const data = require("../data.json")
const Web3 = require("web3")
const { utils } = require("ethers")
const fetch = require("node-fetch")
const coingecko = require("../coingecko.json")
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
const DataDb = require("../models/UpdatePosition")
const update = require("../models/update")
fs = require("fs")

const getHolder = async () => {
  // decode()
  await getApi(14442835, 40000000) //26024907
  // console.log(await DataDb.find())
}
// 0x93d75d64d1f84fc6f430a64fc578bdd4c1e090e90ea2d51773e626d19de56d30 DecreasePosition
// 0x2fe68525253654c21998f35787a8d0f361905ef647c854092430ab65f2f15022 IncreasePosition
// 0x2e1f85a64a2f22cf2f0c42584e7c919ed4abe8d53675cff0f62bf1e95a1c676f LiquidatePosition
// 0x25e8a331a7394a9f09862048843323b00bdbada258f524f5ce624a45bf00aabb UpdatePosition
// 0x73af1d417d82c240fdb6d319b34ad884487c6bf2845d98980cc52ad9171cb455 ClosePosition
const getApi = async (fromBlock, toBlock) => {
  const url = `https://api.arbiscan.io/api?module=logs&action=getLogs&topic0=0x25e8a331a7394a9f09862048843323b00bdbada258f524f5ce624a45bf00aabb&fromBlock=${fromBlock}&toBlock=${toBlock}&apikey=${api_key}`
  const response = await fetch(url)
  console.log(url)
  try {
    const body = JSON.parse(await response.text())
    const lastBlock = parseInt(
      body.result[body.result.length - 1].blockNumber,
      16,
    )
    await saveData(body.result, lastBlock, toBlock)
  } catch (error) {
    console.log(error, { fromBlock, toBlock })
    setTimeout(() => {
      getApi(fromBlock, toBlock)
    }, 4000)
  }
}

const decode = async () => {
  let iface = new utils.Interface([
    "event UpdatePosition (bytes32 key, uint256 size, uint256 collateral, uint256 averagePrice, uint256 entryFundingRate, uint256 reserveAmount, int256 realisedPnl)",
  ])
  const logs = await DataDb.find({blockNumber: {$lt: 40000000}})
  for await (let log of logs) {
    const data = {
      topics: [log.topics],
      data: log.data
    }
    console.log(log)
    const parsedLogs = iface.parseLog(data)
    const saveData = {
      txHash: log.txHash,
      size: parsedLogs.args.size.toString(),
      collateral: parsedLogs.args.collateral.toString(),
      leverage: ((parsedLogs.args.size)/(parsedLogs.args.collateral)).toString(),
      averagePrice: parsedLogs.args.averagePrice.toString(),
      reserveAmount: parsedLogs.args.reserveAmount.toString(),
      key: parsedLogs.args.key,
      timesStamp: parseInt(log.timesStamp)
    }
    let newUpdate = new update(saveData)
    newUpdate.save()
    console.log("@@@@", saveData)
  }
}

const saveData = async (data, lastBlock, toBlock) => {
  console.log("saving data...")
  let continueBlock = parseInt(data[data.length - 1].blockNumber) + 1
  const savingData = []
  for await (let a of data) {
    if (data.length == range && a.blockNumber == lastBlock) {
      continueBlock = parseInt(data[data.length - 1].blockNumber)
      continue
    }
    savingData.push(fomatData(a))
  }
  await DataDb.bulkWrite(savingData)
  console.log("data saved!")
  if (data.length < range) {
    process.exit()
  }
  console.log("continue form ", continueBlock)
  setTimeout(() => {
    getApi(continueBlock, toBlock)
  }, 100)
}

const fomatData = (data) => {
  return {
    insertOne: {
      document: {
        txHash: data.transactionHash,
        address: data.address,
        topics: data.topics.toString(),
        data: data.data,
        blockNumber: parseInt(data.blockNumber).toString(),
        timesStamp: parseInt(data.timeStamp).toString(),
      },
    },
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
}
