var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var HackedDataSchema = new Schema(
    {
        tx_hash: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        spender: {
            type: String,
            required: true,
        },
        owner: {
            type: String,
            required: true,
        },
        blockNumber: {
            type: String,
            required: false,
        },
        tx_origin: {
            type: String,
            required: false,
            default: "0"
        },
        amount: {
            type: String,
            required: false,
        },
    },
    { timestamps: false },
);

module.exports = mongoose.model("hacked_data", HackedDataSchema);
