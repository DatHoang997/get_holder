var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var IncreasePositionSchema = new Schema(
    {
        txHash: {
            type: String,
            required: true,
            unique: true
        },
        address: {
            type: String,
            required: true,
        },
        topics: {
            type: String,
        },
        data: {
            type: String,
            required: true,
        },
        blockNumber: {
            type: Number,
            required: true,
        },
        timesStamp: {
            type: Number,
            required: true,
        },
    },
    { timestamps: false },
);

module.exports = mongoose.model("IncreasePosition", IncreasePositionSchema);
