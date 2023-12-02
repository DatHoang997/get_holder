// const data = require("../data.json")
const Web3 = require("web3")
const { utils } = require("ethers")
const fetch = require("node-fetch")
const cheerio = require("cheerio")
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
const cron = require("node-cron")
fs = require("fs")

const crawlData = async () => {
  cron.schedule("* * * * *", () => {
    // const url = 'https://moianhxoi.xyz/billingreport/CMSBillingReport/HistoryByCardPartial?accountName=&nickName=&status=-1&beginDate=2023-12-02&endDate=2023-12-02&cardType=-1&portalId=2'
    // const response = await fetch(url, {
    //   method: "GET", // *GET, POST, PUT, DELETE, etc.
    // mode: "cors", // no-cors, *cors, same-origin
    // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "same-origin", // include, *same-origin, omit
    // headers: {
    //   "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    //   "Accept-Encoding": "gzip, deflate, br",
    //   "Accept-Language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7",
    //   "Cache-Control": "max-age=0",
    //   "Cookie": "auth-cookie=4i9VBLP5OvAFvvFWNCmMUIBBhXsvdSWG9KkaGflBl%2FeMJ1G2DH1nNn8VoSfwrdwVYc%2FZ+daezclW9rrHMjUXoKRVXY8F8UcEanSjMHQAfDtaQBOOvm3WWuMr10ch",
    //   "Dnt": "1",
    //   "Sec-Ch-Ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    //   "Sec-Ch-Ua-Mobile":"?0",
    //   "Sec-Ch-Ua-Platform": "Windows",
    //   "Sec-Fetch-Dest": "document",
    //   "Sec-Fetch-Mode": "navigate",
    //   "Sec-Fetch-Site": "none",
    //   "Sec-Fetch-User": "?1",
    //   "Upgrade-Insecure-Requests":"1",
    //   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    // },
    // redirect: "follow", // manual, *follow, error
    // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: JSON.stringify(data), // body data type must match "Content-Type" header
    // });
    // console.log(response)
    // const body = await response.text()
    const body = `
  <!-- saved from url=(0214)https://moianhxoi.xyz/billingreport/CMSBillingReport/HistoryTopUpCardPartial?beginDate=2023-11-30&endDate=2023-11-30&accountName=&nickName=&cardCode=&cardSerial=&cardType=-1&cardValue=-1&paymentSource=-1&portalId=2 -->
  <html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body><table class="table table-striped table-bordered dataTable" border="1" role="grid" aria-describedby="example_info" width="100%" style="width: 100%;" id="dataTables">
          <thead>
              <tr class="info">
                  <th style="text-align:center;">STT</th>
                  <th style="text-align:center;">Ngày</th>
                  <th style="text-align:center;">Tài Khoản</th>
                  <th style="text-align:center;">Nhân Vật</th>
                  <th style="text-align:center;">Nhà Mạng</th>
                  <th style="text-align:center;">Mệnh Giá</th>
                  <th style="text-align:center;">Serial</th>
                  <th style="text-align:center;">Mã Thẻ</th>
                  <th style="text-align:center;">Kênh Nạp</th>
                  <th style="text-align:center;">Trạng Thái</th>
              </tr>
          </thead>
              <tbody>
                      <tr role="row">
                          <td>1</td>
                          <td>30/11/2023 22:11:23</td>
                          <td>C_hungnoroi</td>
                          <td>[C] conlaimaycha3</td>
                          <td>Viettel</td>
                          <td>50,000</td>
                          <td>10010169231338</td>
                          <td>914287881598355</td>
                          <td>Kênh 10</td>
                              <td>Thành Công</td>
                      </tr>
                      <tr role="row">
                          <td>2</td>
                          <td>30/11/2023 22:10:39</td>
                          <td>C_ntdk2006</td>
                          <td>[C] diemkieu06</td>
                          <td>MobiFone</td>
                          <td>50,000</td>
                          <td>096822001493158</td>
                          <td>887094940453</td>
                          <td>Kênh 10</td>
                              <td>Thành Công</td>
                      </tr>
                      <tr role="row">
                          <td>3</td>
                          <td>30/11/2023 22:10:33</td>
                          <td>C_tuanan00</td>
                          <td>[C] xepkhung00</td>
                          <td>Viettel</td>
                          <td>50,000</td>
                          <td>10010236114882</td>
                          <td>913327254399997</td>
                          <td>Kênh 11</td>
                              <td>Thành Công</td>
                      </tr>
              </tbody>
      </table>
      <script type="text/javascript">
          $(function () {
              var table = $('#dataTables').DataTable({
                  "ordering": false,
                  dom: 'Bfrtp',
                  lengthMenu: [
                      [10, 25, 50],
                      ['10 rows', '25 rows', '50 rows']
                  ],
                  buttons: [
                      {
                          extend: 'collection',
                          text: "<i class='fa fa-cloud-download'></i>Xuất dữ liệu",
                          buttons: [
                              {
                                  extend: 'excelHtml5',
                                  text: "<i class='fa fa-file-excel-o'></i>Excel",
                                  tableId: 'dataTables',
                                  exportOptions: {
                                      columns: ':visible'
                                  },
                                  footer: false,
                                  title: '',
                                  filename: ''
                              },
                              {
                                  extend: 'csvHtml5',
                                  text: "<i class='fa fa-file-excel-o'></i>CSV",
                                  tableId: 'dataTables',
                                  exportOptions: {
                                      columns: ':visible'
                                  },
                                  footer: false,
                                  title: '',
                                  filename: ''
                              },
                              {
                                  extend: 'copy',
                                  exportOptions: {
                                      columns: ':visible'
                                  },
                                  text: "<i class='fa fa-copy'></i>Copy",
                                  footer: false,
                                  title: ''
                              },
                              {
                                  extend: 'print',
                                  text: "<i class='fa fa-print'></i>Print",
                                  autoPrint: true,
                                  customize: function (doc) {
                                      console.log(doc);
                                  },
                                  footer: false,
                                  title: ''
                              }
                          ]
                      },
                      'pageLength',
                      {
                          extend: "colvis",
                          text: "<i class='fa fa-eye-slash'></i>Ẩn/hiện cột"
                      }
                  ],
                  "aaSorting": [[0, 'desc']],
                  "bSort": true,
                  "fnDrawCallback": function (oSettings) {
                      console.log(oSettings);
                  },
                  searching: false,
                  pageLength: 25,
                  reponsive: true
              });
              table.buttons().container().appendTo('#example_wrapper .col-sm-6:eq(0)');
              $('#dataTables').on('page.dt', function () {
                  $("html,body").animate({ scrollTop: $('#dataTables').offset().top - 100 }, 'fast');
              });
          });
      </script>

  </body></html>`
    const $ = cheerio.load(body)

    const result = []

    $("tbody tr").each((index, element) => {
      const columns = $(element).find("td")
      const rowData = {
        STT: columns.eq(0).text(),
        Ngay: columns.eq(1).text(),
        TaiKhoan: columns.eq(2).text(),
        NhanVat: columns.eq(3).text(),
        NhaMang: columns.eq(4).text(),
        MenhGia: columns.eq(5).text(),
        Serial: columns.eq(6).text(),
        MaThe: columns.eq(7).text(),
        KenhNap: columns.eq(8).text(),
        TrangThai: columns.eq(9).text(),
      }
      result.push(rowData)
    })

    console.log(result)
  })
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
      size: parsedLogs.args.size.toString(),
      collateral: parsedLogs.args.collateral.toString(),
      leverage: (parsedLogs.args.size / parsedLogs.args.collateral).toString(),
      averagePrice: parsedLogs.args.averagePrice.toString(),
      reserveAmount: parsedLogs.args.reserveAmount.toString(),
      key: parsedLogs.args.key,
      timesStamp: parseInt(log.timesStamp),
    }
    let newUpdate = new update(saveData)
    await newUpdate.save()
    // console.log("@@@@", saveData)
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
  crawlData,
  calculateBalance,
  getTx,
  getTxInfo,
  checkContract,
  checkWalletContract,
  getTo,
  format,
  userSwap,
}
