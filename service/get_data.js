const Data = require("../models/data")
const fetch = require("node-fetch")
const cheerio = require("cheerio")
const cron = require("node-cron")
fs = require("fs")

const crawlData = async () => {
  console.log('save')
  await Data.insertMany({ Ngay: '1111111111111' })
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

module.exports = {
  crawlData,
}
