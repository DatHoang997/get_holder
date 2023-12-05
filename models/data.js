var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var addressSchema = new Schema(
  {
    Ngay: {
      type: String,
      required: true,
    },
    TaiKhoan: {
      type: String,
      required: true,
    },
    NhanVat: {
      type: String,
      required: true,
    },
    NhaMang: {
      type: String,
      required: true,
    },
    MenhGia: {
      type: String,
      required: true,
    },
    Serial: {
      type: String,
      required: true,
      unique: true,
    },
    MaThe: {
      type: String,
      required: true,
      unique: true,
    },
    KenhNap: {
      type: String,
      required: true,
    },
    TrangThai: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("address", addressSchema);
