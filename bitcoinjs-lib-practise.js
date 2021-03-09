const Bts = require('bitcoinjs-lib');
const TestNet = Bts.networks.testnet;

//使用Bitcoinjs常见比特币地址
let keyPair = Bts.ECPair.makeRandom({ network: TestNet});
let address = keyPair.getAddress();
let wifKey = keyPair.toWIF();
console.log('Address:${address} \n WifKey:${wifKey}');