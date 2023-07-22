var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DataSchema = new Schema(
    {
        txHash: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
            default: 0,
        },
        topics: {
            type: String,
            default: 0,
        },
        data: {
            type: String,
            required: true,
            default: 0,
        },
        blockNumber: {
            type: String,
            required: true,
            default: 0,
        },
        timesStamp: {
            type: String,
            required: true,
            default: 0,
        },
    },
    { timestamps: false },
);

module.exports = mongoose.model("hacked", DataSchema);
