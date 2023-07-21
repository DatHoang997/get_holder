var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UpdatePositionSchema = new Schema(
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
            type: Number,
            required: true,
            default: 0,
        },
        timesStamp: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: false },
);

module.exports = mongoose.model("UpdatePosition", UpdatePositionSchema);
