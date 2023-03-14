const { ethers } = require("ethers");

const swapXContract = [
    "0x0000000000000000000000008f34c8232d482cb65fea0d05184596001997d352",
    "0x000000000000000000000000544fde4e25dd7e0aff084f4975d808ae366b746b",
    "0x0000000000000000000000006D8981847Eb3cc2234179d0F0e72F6b6b2421a01",
    "0x000000000000000000000000618bec079bc8f419b86d8d5a63b58f04af127d6a",
    "0x00000000000000000000000098c2581ab3f11b0d4ffb1271fad96eadb9dbbb6d",
    "0x00000000000000000000000008b2681a178a6b8c6d39e542756369d60a0e6eda",
];

const lz_address = "0x3b78458981eb7260d1f781cb8be2caac7027dbe2";

const api_key = "VSUEYZSSBWGFSMZ9XU1RECMWZWVMQ4R3G9";

const bn = ethers.BigNumber.from;

const range = 1000;

module.exports = {
    swapXContract,
    lz_address,
    api_key,
    bn,
    range
};