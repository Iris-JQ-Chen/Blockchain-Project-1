/**
 * 为了避免一个私钥的丢失导致地址的资金丢失，比特币引入了多重签名机制，可以实现分散风险的功能。
 * 多重签名地址实际上是一个Script Hash，以2-3类型的多重签名为例
 * 
 * 利用多重签名，可以实现：
 * 1-2，两人只要有一人同意即可使用资金；
 * 2-2，两人必须都同意才可使用资金；
 * 2-3，3人必须至少两人同意才可使用资金；
 * 4-7，7人中多数人同意才可使用资金。
 * 最常见的多重签名是2-3类型。
 * 比特币的多重签名最多允许15个私钥参与签名，即可实现1-2至15-15的任意组合（1⩽M⩽N⩽15）。
 */

const bitcoin = require('bitcoinjs-lib');
let
    pubKey1 = '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
    pubKey2 = '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
    pubKey3 = '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
    pubKeys = [pubKey1,pubKey2,pubKey3].map(s => Buffer
        .from(s,'hex'));//把String转换成Buffer

//创建2-3 RedeemScript
let redeemScript = bitcoin.script.multisig.output.encode(2,pubKeys);
console.log('Redeem Script: '+redeemScript.toString('hex'));

//编码
let scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript));
let address = bitcoin.address.fromOutputScript(scriptPubKey);
console.log('Multisig address: '+ address);