var mongoose = require("mongoose");

var TxSchema = mongoose.Schema;

var TxSchema = new TxSchema(
  {
    tx_hash: {
      type: String,
      required: false,
      default: 0,
    },
    from: {
      type: String,
      required: false,
      default: 0,
    },
    to: {
      type: String,
      required: false,
      default: 0,
    },
    value: {
      type: String,
      required: false,
      unique: false,
    },
    blockNumber: {
      type: String,
      required: false,
      unique: false,
    },
  },
  { timestamps: false },
);

module.exports = mongoose.model("tx", TxSchema);
