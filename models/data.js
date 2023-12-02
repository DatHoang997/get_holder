var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var addressSchema = new Schema(
  {
    Ngay: {
      type: String,
      required: true,
      unique: true,
    },
    // TaiKhoan: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    // NhanVat: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    // NhaMang: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    // MenhGia: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    // Serial: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    // MaThe: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    // KenhNap: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    // TrangThai: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
  },
  { timestamps: false },
);

module.exports = mongoose.model("address", addressSchema);
