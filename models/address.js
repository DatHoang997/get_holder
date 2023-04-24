var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var addressSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
    contract: {
      type: String,
    },
  },
  { timestamps: false },
);

module.exports = mongoose.model("address", addressSchema);
