var mongoose = require("mongoose")

var Schema = mongoose.Schema

var increaseSchema = new Schema(
  {
    txHash: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      default: 0,
    },
    account: {
      type: String,
      default: 0,
    },
    collateralToken: {
      type: String,
      required: true,
      default: 0,
    },
    indexToken: {
      type: String,
      required: true,
      default: 0,
    },
    isLong: {
      type: Boolean,
      required: true,
      default: 0,
    },
    size: {
      type: String,
      required: true,
      default: 0,
    },
    collateral: {
      type: String,
      required: true,
      default: 0,
    },
    reserveAmount: {
      type: String,
      required: true,
      default: 0,
    },
    markPrice: {
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

module.exports = mongoose.model("liquidate", increaseSchema)
