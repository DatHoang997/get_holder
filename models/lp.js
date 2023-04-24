var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var LpSchema = new Schema(
    {
        address: {
            type: String,
            unique: true,
        },
        block1: {
            type: String,
            required: false,
            default: 0,
        },
        block2: {
            type: String,
            required: false,
            default: 0,
        },
        block3: {
            type: String,
            required: false,
            default: 0,
        }
    },
    { timestamps: false },
);

module.exports = mongoose.model("lp", LpSchema);
