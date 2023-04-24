var mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

var Schema = mongoose.Schema;

var BottomFishingSchema = new Schema(
    {
        tx_hash: {
            type: String,
            required: true,
        },
        tx_origin: {
            type: String,
            required: false,
            default: 0,
        },
        from: {
            type: String,
            required: true,
            default: 0,
        },
        to: {
            type: String,
            required: true,
            default: 0,
        },
        amount: {
            type: String,
            required: true,
            default: 0,
        },
        blocknumber: {
            type: String,
            required: true,
            default: 0,
        },
        transfer: {
            type: Boolean,
        },
        price: {
          type: String,
      },
    },
    { timestamps: false },
);

module.exports = mongoose.model("bottomFishing", BottomFishingSchema);
