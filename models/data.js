var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var HackedSchema = new Schema(
    {
        tx_hash: {
            type: String,
            required: true,
        },
        tx_origin: {
            type: String,
            required: true,
            default: 0,
        },
        wallet: {
            type: String,
            required: true,
            default: 0,
        },
        spender: {
            type: String,
            required: true,
            default: 0,
        },
        token: {
            type: String,
            required: true,
            default: 0,
        },
        amount: {
            type: String,
            required: true,
            default: 0,
        },
    },
    { timestamps: false },
);

module.exports = mongoose.model("hacked", HackedSchema);
