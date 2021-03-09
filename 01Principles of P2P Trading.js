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

 /**
  * 私钥
  */
// const bitcoin = require('bitcoinjs-lib');
// let keyPair = bitcoin.ECPair.makeRandom();
// // 打印私钥:
// console.log('private key = ' + keyPair.d);
// // 以十六进制打印:
// console.log('hex = ' + keyPair.d.toHex());
// // 补齐32位:
// console.log('hex = ' + keyPair.d.toHex(32));

// const bitcoin = require('bitcoinjs-lib');
// const wif = require('wif');
const BigInteger = require('bigi');

// // 十六进制表示的私钥:
// let privateKey = '0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d';
// // 对私钥编码:
// let encoded = wif.encode(0x80,Buffer.from(privateKey,'hex'),false);//非压缩格式
// console.log(encoded);
// encoded = wif.encode(0x80,Buffer.from(privateKey,'hex'),true);//压缩格式
// console.log(encoded);

// let
//     priv = '0c28fca386c7a227600b2fe50b7cae11ec86d3bf1fbe471be89827e19d72aa1d',
//     d = BigInteger.fromBuffer(Buffer.from(priv, 'hex')),
//     keyPair = new bitcoin.ECPair(d);
// // 打印WIF格式的私钥:
// console.log(keyPair.toWIF());

/**
 * 公钥
 * 
 * 比特币的公钥是根据私钥计算出来的。
 * 私钥本质上是一个256位整数，记作k。根据比特币采用的ECDSA算法，可以推导出两个256位整数，记作(x, y)，这两个256位整数即为非压缩格式的公钥。
 * 由于ECC曲线的特点，根据非压缩格式的公钥(x, y)的x实际上也可推算出y，但需要知道y的奇偶性
 * 因此，可以根据(x, y)推算出x'，作为压缩格式的公钥
 * 压缩格式的公钥实际上只保存x这一个256位整数，但需要根据y的奇偶性在x前面添加02或03前缀，y为偶数时添加02，否则添加03
 * 得到一个1+32=33字节的压缩格式的公钥数据，记作x'
 * 压缩格式的公钥和非压缩格式的公钥是可以互相转换的，但均不可反向推导出私钥
 */
// const bitcoin = require('bitcoinjs-lib');
// let
//     wif = 'KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617',
//     ecPair = bitcoin.ECPair.fromWIF(wif);//导入私钥
// //计算公钥
// let pubKey = ecPair.getPublicKeyBuffer();//返回buffer对象
// console.log(pubKey.toString('hex'));//得到02或者03开头的压缩公钥

/**
 * 要特别注意，比特币的地址并不是公钥，而是公钥的哈希，即从公钥能推导出地址，但从地址不能反推公钥，因为哈希函数是单向函数。
 * 从公钥计算地址的方法是，首先对1+32=33字节的公钥数据进行Hash160（即先计算SHA256，再计算RipeMD160），得到20字节的哈希。然后，添加0x00前缀，得到1+20=21字节数据，再计算4字节校验码，拼在一起，总计得到1+20+4=25字节数据：
 * 对上述25字节数据进行Base58编码，得到总是以1开头的字符串，该字符串即为比特币地址
 * 
 * 以1开头的字符串地址即为比特币收款地址，可以安全地公开给任何人。
 */

// const bitcoin = require('bitcoinjs-lib');
// let
//     publicKey = '02d0de0aaeaefad02b8bdc8a01a1b8b11c696bd3d66a2c5f10780d95b7df42645c',
//     ecPair = bitcoin.ECPair.fromPublicKeyBuffer(Buffer.from(publicKey,'hex'));//导入公钥
// //计算得出地址
// let address = ecPair.getAddress();
// console.log(address);//1开头的地址

/**
 * 签名
 * 
 * 签名算法是使用私钥签名，公钥验证的方法，对一个消息的真伪进行确认
 * 如果一个人持有私钥，他就可以使用私钥对任意的消息进行签名，即通过私钥sk对消息message进行签名，得到signature
 * signature = sign(message, sk);
 * 签名的目的是为了证明，该消息确实是由持有私钥sk的人发出的，任何其他人都可以对签名进行验证。
 * 验证方法是，由私钥持有人公开对应的公钥pk，其他人用公钥pk对消息message和签名signature进行验证：
 * isValid = verify(message, signature, pk);
 * 如果验证通过，则可以证明该消息确实是由持有私钥sk的人发出的，并且未经过篡改。
 * 1、签名不可伪造，因为私钥只有签名人自己知道，所以其他人无法伪造签名
 * 2、消息不可篡改，如果原始消息被人篡改了，对签名进行验证将失败
 * 3、签名不可抵赖，如果对签名进行验证通过了，签名人不能抵赖自己曾经发过这一条消息
 * 简单地说来，数字签名可以防伪造，防篡改，防抵赖。
 * 对消息进行签名，实际上是对消息的哈希进行签名，这样可以使任意长度的消息在签名前先转换为固定长度的哈希数据。
 * 我们来看看使用ECDSA如何通过私钥对消息进行签名。关键代码是通过sign()方法签名，并获取一个ECSignature对象表示签名：
 */
// const bitcoin = require('bitcoinjs-lib');
// let
//     message = 'a secret message!',//原始消息
//     hash = bitcoin.crypto.sha256(message),//消息哈希
//     wif = 'KwdMAjGmerYanjeui5SHS7JkmpZvVipYvB2LJGU1ZxJwYvP98617',
//     keyPair = bitcoin.ECPair.fromWIF(wif);
// //用私钥签名
// let signature = keyPair.sign(hash).toDER();// ECSignature对象
// //打印签名
// console.log('signature = '+signature.toString('hex'));
// console.log('public key = '+ keyPair.getPublicKeyBuffer().toString('hex'));
/**
 * ECSignature对象可序列化为十六进制表示的字符串
 * 在获得签名、原始消息和公钥的基础上，可以对签名进行验证。验证签名需要先构造一个不含私钥的ECPair，然后调用verify()方法验证签名：
 */
const bitcoin = require('bitcoinjs-lib');
let 
    signAsStr = '304402205d0b6e817e01e22ba6ab19c0'
                 + 'ab9cdbb2dbcd0612c5b8f990431dd063'
                 + '4f5a96530220188b989017ee7e830de5'
                 + '81d4e0d46aa36bbe79537774d56cbe41'
                 + '993b3fd66686',
    signAsBuffer = Buffer.from(signAsStr,'hex');
    signature = bitcoin.ECSignature.fromDER(signAsBuffer),//ECSignature对象
    message = 'a secret message!',//原始消息
    //message = 'a secret message',//错误消息
    hash = bitcoin.crypto.sha256(message),//消息哈希
    pubKeyAsStr = '02d0de0aaeaefad02b8bdc8a01a1b8b11c696bd3d66a2c5f10780d95b7df42645c',
    pubKeyAsBuffer = Buffer.from(pubKeyAsStr,'hex'),
    pubKeyOnly = bitcoin.ECPair.fromPublicKeyBuffer(pubKeyAsBuffer);//从public key构造ECPair
//验证签名
let result = pubKeyOnly.verify(hash,signature);
console.log('Verify result :'+result);

