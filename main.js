const { JsonRpcProvider } = require("@ethersproject/providers");
const { AssistedJsonRpcProvider } = require("assisted-json-rpc-provider");
const { getHolder } = require("./get_holder");
const mongoose = require("mongoose");

const rpc =
    "https://bsc-mainnet.nodereal.io/v1/eb8693749b3e481781d8ab685c3b9c3c";
const bsc_api = "https://api.bscscan.com/api";
const api_key = [
    "HBCK76GVW2FKXRECNV5MFYF4S4PWENZ8AY",
    "U1BKBVNXX3XYF81MPEVP5V97M51IY1C1AF",
    "92PK33JCRS9A2ECTA2ZRAN8KF7TZBSVRYN]",
];
const mongo_url = "mongodb://localhost:27017/get_event";

start = async () => {
    let provider = await getProvider();
    getHolder(provider);
};

mongoose
    .connect(mongo_url)
    .then(() => {
        console.log("Connected to %s", mongo_url);
        console.log("Press CTRL + C to stop the process. \n");
    })
    .catch((err) => {
        console.error("App starting error:", err.message);
        process.exit(1);
    });

getProvider = async () => {
    return (provider = new AssistedJsonRpcProvider(
        new JsonRpcProvider({
            timeout: 6000,
            url: rpc,
        }),
        {
            rateLimitCount: 5,
            rateLimitDuration: 1000,
            rangeThreshold: 4000,
            maxResults: 1000,
            url: bsc_api,
            apiKeys: api_key,
        },
    ));
};

start();
