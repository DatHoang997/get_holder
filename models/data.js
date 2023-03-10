var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DataSchema = new Schema(
    {
        blockNumber: {
            type: String,
            required: true,
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
            default: 0,
        },
    },
    { timestamps: false },
);

module.exports = mongoose.model("data", DataSchema);
