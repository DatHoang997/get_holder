const apiResponse = require("../helpers/apiResponse");
const Wallet = require("../models/events");

exports.getHolder = [
    async (req, res) => {
        let holder = await Wallet.find({ 'value': { $gt: 5 } });
        return apiResponse.successResponseWithData(
            res,
            "Operation success",
            holder,
        );
    },
];
