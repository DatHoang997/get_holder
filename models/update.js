var mongoose = require("mongoose")

var Schema = mongoose.Schema

var updateSchema = new Schema(
  {
    txHash: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
      default: 0,
    },
    collateral: {
      type: String,
      default: 0,
    },
    leverage: {
      type: String,
      required: true,
      default: 0,
    },
    averagePrice: {
      type: String,
      required: true,
      default: 0,
    },
    reserveAmount: {
      type: String,
      required: true,
      default: 0,
    },
    key: {
      type: String,
      required: true,
      default: 0,
    },
    timesStamp: {
      type: Number,
      required: true,
      default: 0,
    },
    blockNumber: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: false },
)

module.exports = mongoose.model("update", updateSchema)
