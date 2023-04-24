const { AssistedJsonRpcProvider } = require("assisted-json-rpc-provider");
const { JsonRpcProvider } = require("@ethersproject/providers");

const rpc ="https://bsc.rpc.blxrbdn.com	";
const bsc_api = "https://api.bscscan.com/api";
const api_key = [
    "HBCK76GVW2FKXRECNV5MFYF4S4PWENZ8AY",
    "U1BKBVNXX3XYF81MPEVP5V97M51IY1C1AF",
    "92PK33JCRS9A2ECTA2ZRAN8KF7TZBSVRYN]",
];

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

module.exports = {
    getProvider,
};