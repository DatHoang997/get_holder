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
    size: {
      type: String,
      default: 0,
    },
    collateral: {
      type: String,
      required: true,
      default: 0,
    },
    averagePrice: {
      type: String,
      required: true,
      default: 0,
    },
    entryFundingRate: {
      type: String,
      required: true,
      default: 0,
    },
    reserveAmount: {
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

module.exports = mongoose.model("close", increaseSchema)
