// const bitcoin = require('bitcoinjs-lib'), createHash = require('create-hash');	//能用

// function standardHash(name, data) {
//     let h = createHash(name);
//     return h.update(data).digest();
// }

// function hash160(data) {
//     let h1 = standardHash('sha256', data);
//     let h2 = standardHash('ripemd160', h1);
//     return h2;
// }

// function hash256(data) {
//     let h1 = standardHash('sha256', data);
//     let h2 = standardHash('sha256', h1);
//     return h2;
// }

// let s = 'bitcoin is awesome';
// console.log('ripemd160 = ' + standardHash('ripemd160', s).toString('hex'));
// console.log('  hash160 = ' + hash160(s).toString('hex'));
// console.log('   sha256 = ' + standardHash('sha256', s).toString('hex'));
// console.log('  hash256 = ' + hash256(s).toString('hex'));

/**
 *数字签名的三个作用：防伪造，防篡改，防抵赖。
 * RSA算法，DSA算法和ECDSA算法。比特币采用的签名算法是椭圆曲线签名算法：ECDSA，使用的椭圆曲线是一个已经定义好的标准曲线secp256k1：
y^2=x^3+7y
 *比特币的私钥是一个随机的非常大的256位整数。它的上限，确切地说，比2^256要稍微小一点：
0xFFFF FFFF FFFF FFFF FFFF FFFF FFFF FFFE BAAE DCE6 AF48 A03B BFD2 5E8C D036 4140
 *而比特币的公钥是根据私钥推算出的两个256位整数
 * !!!如果丢失了私钥，就永远无法花费对应公钥的比特币!!!
 * 
 * 在JavaScript中，内置的Number类型使用56位表示整数和浮点数，最大可表示的整数最大只有9007199254740991。
 * 其他语言如Java一般也仅提供64位的整数类型。要表示一个256位的整数，只能使用数组来模拟。
 * bitcoinjs使用bigi这个库来表示任意大小的整数。
 */

// const bitcoin = require('bitcoinjs-lib');
// let keyPair = bitcoin.ECPair.makeRandom();
// // 打印私钥
// console.log('private key = ' + keyPair.d);
// // 以十六进制打印:
// console.log('hex = ' + keyPair.d.toHex());
// // 补齐32位:
// console.log('hex = ' + keyPair.d.toHex(32));

const bitcoin = require('bitcoinjs-lib');
let keyPair = bitcoin.ECPair.makeRandom();
//打印秘钥
console.log('private key = '+keyPair.d);
