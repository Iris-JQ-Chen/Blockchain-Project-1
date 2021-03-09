/**
 * Segwit地址又称隔离见证地址。
 * 在比特币区块链上，经常可以看到类似bc1qmy63mjadtw8nhzl69ukdepwzsyvv4yex5qlmkd这样的以bc开头的地址，这种地址就是隔离见证地址。
 * 
 * Segwit地址有好几种，
 * 1.   一种是以3开头的隔离见证兼容地址（Nested Segwit Address），
 *      从该地址上无法区分到底是多签地址还是隔离见证兼容地址，好处是钱包程序不用修改，可直接付款到该地址。
 * 2.   另一种是原生隔离见证地址（Native Segwit Address），即以bc开头的地址，它本质上就是一种新的编码方式。
 * 
 * 为什么要引入Segwit地址呢？按照官方说法，它的目的是为了解决比特币交易的延展性（Transaction Malleability）攻击。
 */

// const 
//     bitcoin = require('bitcoinjs-lib'),
//     bech32 = require('bech32'),
//     createHash = require('create-hash');
// //压缩公钥
// let publicKey = '02d0de0aaeaefad02b8bdc8a01a1b8b11c696bd3d66a2c5f10780d95b7df42645c';
// //计算hash160
// let
//     sha256 = createHash('sha256'),
//     ripemd160 = createHash('ripemd160'),
//     hash256 = sha256.update(Buffer.from(publicKey, 'hex')).digest(),
//     hash160 = ripemd160.update(hash256).digest();

// //计算bech32编码
// let words = bech32.toWords(hash160);
// //头部添加版本号0x00
// words.unshift(0);

// //对地址编码
// let address = bech32.encode('bc',words);
// console.log(address);


/**
 * 延展性攻击
 * 
 * 每个交易的细节，假设有一个输入和一个输出，它类似：
 * tx = ... input#index ... signature ... output-script ...
 * 而整个交易的哈希可直接根据交易本身计算：tx-hash = dhash(tx)
 * 
 * 但问题出在ECDSA签名算法上。ECDSA签名算法基于私钥计算的签名实际上是两个整数，记作(r, s)，
 * 但由于椭圆曲线的对称性，(r, -s mod N)实际上也是一个有效的签名（N是椭圆曲线的固定参数之一）。
 * 换句话说，对某个交易进行签名，总是可以计算出两个有效的签名，并且这两个有效的签名还可以互相计算出来。
 * 黑客可以在某一笔交易发出但并未落块的时间内，对签名进行修改，使之仍是一个有效的交易。
 * 注意黑客并无法修改任何输入输出的地址和金额，仅能修改签名。但由于签名的修改，使得整个交易的哈希被改变了。
 * 如果修改后的交易先被打包，虽然原始交易会被丢弃，且并不影响交易安全，但这个延展性攻击可用于攻击交易所。
 * 
 * 要解决延展性攻击的问题，有两个办法，一是对交易签名进行归一化（Normalize）。
 * 因为ECDSA签名后总有两个有效的签名(r, s)和(r, -s mod N)，那只接受数值较小的那个签名，
 * 为此比特币引入了一个SCRIPT_VERIFY_LOW_S标志仅接受较小值的签名。
 */



