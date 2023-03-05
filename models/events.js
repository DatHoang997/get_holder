var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var WalletSchema = new Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    value:{
        type: Number,
        required:true,
        default:0
    }
}, { timestamps: false });


module.exports = mongoose.model("wallet", WalletSchema);
