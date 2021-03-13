/**
 * HD 钱包
 * 
 * 某个用户持有的比特币，实际上是其控制的一组UTXO，而这些UTXO可能是相同的地址（对应相同的私钥），也可能是不同的地址（对应不同的私钥）。
 * 
 * 能不能只用一个私钥管理成千上万个地址？实际上是可以的。
 * 虽然椭圆曲线算法决定了一个私钥只能对应一个公钥，但是，可以通过某种确定性算法，
 * 先确定一个私钥k1，然后计算出k2、k3、k4……等其他私钥，就相当于只需要管理一个私钥，剩下的私钥可以按需计算出来。
 * 这种根据某种确定性算法，只需要管理一个根私钥，即可实时计算所有“子私钥”的管理方式，称为HD钱包。
 * HD是Hierarchical Deterministic的缩写，意思是分层确定性。先确定根私钥root，然后根据索引计算每一层的子私钥
 * 
 * HD钱包采用的计算子私钥的算法一个扩展的512位私钥，记作xprv，
 * 它通过SHA-512算法配合ECC计算出子扩展私钥，仍然是512位。通过扩展私钥可计算出用于签名的私钥以及公钥。
 * 扩展私钥总是能计算出扩展公钥，记作xpub
 * 因为xpub只包含公钥，不包含私钥，因此，可以安全地把xpub交给第三方（例如，一个观察钱包），它可以根据xpub计算子层级的所有地址，然后在比特币的链上监控这些地址的余额，但因为没有私钥，所以只能看，不能花。
 * 
 * 因此，HD钱包通过分层确定性算法，实现了以下功能：
 * 1、  只要确定了扩展私钥xprv，即可根据索引计算下一层的任何扩展私钥；
 * 2、  只要确定了扩展公钥xpub，即可根据索引计算下一层的任何扩展公钥；
 * 3、  用户只需保存顶层的一个扩展私钥，即可计算出任意一层的任意索引的扩展私钥。
 * 从理论上说，扩展私钥的层数是没有限制的，每一层的数量被限制在0～2^32，原因是扩展私钥中只有4字节作为索引，因此索引范围是0～2^32。
 * 通常把根扩展私钥记作m，子扩展私钥按层级记作m/x/y/z等：例如，m/0/2表示从m扩展到m/0（索引为0）再扩展到m/0/2（索引为2）。
 * 
 * 但是HD钱包的扩展私钥算法有个潜在的安全性问题，就是如果某个层级的xprv泄露了，可反向推导出上层的xprv，继而推导出整个HD扩展私钥体系。
 * 为了避免这个问题，HD钱包还有一种硬化的衍生计算方式（Hardened Derivation），
 * 它通过算法“切断”了母扩展私钥和子扩展私钥的反向推导。HD规范把索引0～2^31作为普通衍生索引，
 * 而索引2^31～2^32作为硬化衍生索引，硬化衍生索引通常记作0'、1'、2'……，即索引0'=2^31，1'=2^31+1，2'=2^31+2，以此类推。
 * 例如：m/44'/0表示的子扩展私钥，它的第一层衍生索引44'是硬化衍生，实际索引是2^31+44=2147483692。从m/44'/0无法反向推导出m/44'。
 * 
 * 比特币的BIP-32规范详细定义了HD算法原理和各种推导规则，可阅读此文档以便实现HD钱包。
 */

/**
 * HD钱包算法决定了只要给定根扩展私钥，整棵树的任意节点的扩展私钥都可以计算出来。
 * 我们来看看如何利用bitcoinjs-lib这个JavaScript库来计算HD地址：
 */
// const bitcoin = require('bitcoinjs-lib');
// let 
//     xprv = 'xprv9s21ZrQH143K4EKMS3q1vbJo564QAbs98BfXQME6nk8UCrnXnv8vWg9qmtup3kTug96p5E3AvarBhPMScQDqMhEEm41rpYEdXBL8qzVZtwz',
//     root = bitcoin.HDNode.fromBase58(xprv);
// // m/0
// var m_0 = root.derive(0);
// console.log('xprv m/0:'+m_0.toBase58());
// console.log('xprv m/0:'+m_0.neutered().toBase58());
// console.log(' prv m/0:'+m_0.keyPair.toWIF());
// console.log(' pub m/0:'+m_0.keyPair.getAddress());
// // m/1
// var m_1 = root.derive(0);
// console.log('xprv m/1:'+m_1.toBase58());
// console.log('xprv m/1:'+m_1.neutered().toBase58());
// console.log(' prv m/1:'+m_1.keyPair.toWIF());
// console.log(' pub m/1:'+m_1.keyPair.getAddress());

/**
 * 可以从某个xpub在没有xprv的前提下直接推算子公钥：
 */
// const bitcoin = require('bitcoinjs-lib');
// let
//     xprv = 'xprv9s21ZrQH143K4EKMS3q1vbJo564QAbs98BfXQME6nk8UCrnXnv8vWg9qmtup3kTug96p5E3AvarBhPMScQDqMhEEm41rpYEdXBL8qzVZtwz',
//     root = bitcoin.HDNode.fromBase58(xprv);
// // m/0
// let
//     m_0 = root.derive(0),
//     xprv_m_0 = m_0.toBase58(),
//     xpub_m_0 = m_0.neutered().toBase58();
// //方法一：从m/0的扩展私钥推算出m/0/99的公钥地址
// let pub_99a = bitcoin.HDNode.fromBase58(xprv_m_0).derive(99).getAddress();
// //方法二：从m/0的扩展公钥推算出m/0/99的公钥地址
// let pub_99b = bitcoin.HDNode.fromBase58(xpub_m_0).derive(99).getAddress();
// console.log(pub_99a+'\n');
// console.log(pub_99b);

/**
 * 但不能从xpub推算硬化的子公钥：
 */
// const bitcoin = require('bitcoinjs-lib');
// let
//     xprv = 'xprv9s21ZrQH143K4EKMS3q1vbJo564QAbs98BfXQME6nk8UCrnXnv8vWg9qmtup3kTug96p5E3AvarBhPMScQDqMhEEm41rpYEdXBL8qzVZtwz',
//     root = bitcoin.HDNode.fromBase58(xprv);
// //m/0
// let
//     m_0 = root.derive(0),
//     xprv_m_0 = m_0.toBase58(),
//     xpub_m_0 = m_0.neutered().toBase58();
// //从m/0的扩展私钥推算出m/0/99的公共地址
// let pub_99a = bitcoin.HDNode.fromBase58(xprv_m_0).deriveHardened(99).getAddress();
// console.log(pub_99a);
// //不能从m/0的扩展公钥推算出m/0/99的公钥地址
// // bitcoin.HDNode.fromBase58(xpub_m_0).deriveHardened(99).getAddress();

/**
 * HD钱包理论上有无限的层级，对使用secp256k1算法的任何币都适用。
 * 但是，如果一种钱包使用m/1/2/x，另一种钱包使用m/3/4/x，没有一种统一的规范，就会乱套
 * 比特币的BIP-44规范定义了一种如何派生私钥的标准，它本身非常简单：
 * m / purpose' / coin_type' / account' / change / address_index
 * 其中，purpose总是44，coin_type在SLIP-44中定义，例如，0=BTC，2=LTC，60=ETH等。
 * account表示用户的某个“账户”，由用户自定义索引，
 * change=0表示外部交易，
 * change=1表示内部交易，
 * address_index则是真正派生的索引为0～231的地址。
 */
//  例如，某个比特币钱包给用户创建的一组HD地址实际上是：
//  m/44'/0'/0'/0/0
//  m/44'/0'/0'/0/1
//  m/44'/0'/0'/0/2
//  m/44'/0'/0'/0/3
//  ...
// 如果是莱特币钱包，则用户的HD地址是：
//  m/44'/2'/0'/0/0
//  m/44'/2'/0'/0/1
//  m/44'/2'/0'/0/2
//  m/44'/2'/0'/0/3
//  ...

/**
 * 助记词
 * 
 * 从HD钱包的创建方式可知，要创建一个HD钱包，我们必须首先有一个确定的512bit（64字节）的随机数种子。
 * 如果用电脑生成一个64字节的随机数作为种子当然是可以的，但是恐怕谁也记不住。
 * 如果自己想一个句子，例如bitcoin is awesome，然后计算SHA-512获得这个64字节的种子，虽然是可行的，但是其安全性取决于自己想的句子到底有多随机。像bitcoin is awesome本质上就是3个英文单词构成的随机数，长度太短，所以安全性非常差。
 * 为了解决初始化种子的易用性问题，BIP-39规范提出了一种通过助记词来推算种子的算法：
 * 以英文单词为例，首先，挑选2048个常用的英文单词，构造一个数组：
 * const words = ['abandon', 'ability', 'able', ..., 'zoo'];
 * 然后，生成128~256位随机数，注意随机数的总位数必须是32的倍数。
 * 在随机数末尾加上校验码，校验码取SHA-256的前若干位，并使得总位数凑成11的倍数，
 * 将随机数+校验码按每11 bit一组，得到范围是0~2047的24个整数，把这24个整数作为索引，就得到了最多24个助记词，例如：
 * bleak version runway tell hour unfold donkey defy digital abuse glide please omit much cement sea sweet tenant demise taste emerge inject cause link
 * 由于在生成助记词的过程中引入了校验码，所以，助记词如果弄错了，软件可以提示用户输入的助记词可能不对。
 * 生成助记词的过程是计算机随机产生的，用户只要记住这些助记词，就可以根据助记词推算出HD钱包的种子。
 * 同样索引的中文和英文生成的HD种子是不同的。各种语言的助记词定义在bip-0039-wordlists.md。
 */
// const bip39 = require('bip39');
// let words = bip39.generateMnemonic(256);
// console.log(words);
// console.log('is valid mnemonic?'+bip39.validateMnemonic(words));
// //如果想用中文作助记词也是可以的，给generateMnemonic()传入一个中文助记词数组即可：
// var words_c = bip39.generateMnemonic(256,null,bip39.wordlists.chinese_simplified);// 第二个参数rng可以为null:
// console.log(words_c);

/**根据助记词推算种子
 * 
 * 根据助记词推算种子的算法是PBKDF2，使用的哈希函数是Hmac-SHA512，
 * 其中，输入是助记词的UTF-8编码，并设置Key为mnemonic+用户口令，循环2048次，
 * 得到最终的64字节种子。上述助记词加上口令bitcoin得到的HD种子是：
 * 该种子即为HD钱包的种子。
 */
// const bip39 = require('bip39');
// let words = bip39.generateMnemonic(256);
// console.log(words);
// let seedBuffer = bip39.mnemonicToSeed(words);
// let seedAsHex = seedBuffer.toString('hex');
// // or use bip39.mnemonicToSeedHex(words)
// console.log(seedAsHex);

/**
 * 根据助记词和口令生成HD种子的方法是在mnemonicToSeed()函数中传入password：
 */
// const bip39 = require('bip39');
// let words = bip39.generateMnemonic(256);
// console.log(words);
// let password = 'bitcoin';
// let seedAsHex = bip39.mnemonicToSeedSync(words,password);
// console.log(seedAsHex.toString("hex"));

/**
 * 从助记词算法可知，只要确定了助记词和口令，生成的HD种子就是确定的。
 * 如果两个人的助记词相同，那么他们的HD种子也是相同的。这也意味着如果把助记词抄在纸上，一旦泄漏，HD种子就泄漏了。
 * 如果在助记词的基础上设置了口令，那么只知道助记词，不知道口令，也是无法推算出HD种子的。
 * 把助记词抄在纸上，口令记在脑子里，这样，泄漏了助记词也不会导致HD种子被泄漏，但要牢牢记住口令。
 * 最后，我们使用助记词+口令的方式来生成一个HD钱包的HD种子并计算出根扩展私钥：
 */
// const
//     bitcoin = require('bitcoinjs-lib'),
//     bip39 = require('bip39');
// let
//     words = 'bleak version runway tell hour unfold donkey defy digital abuse glide please omit much cement sea sweet tenant demise taste emerge inject cause link',
//     password = 'bitcoin';
// //计算seed
// let seedHex = bip39.mnemonicToSeedSync(words,password).toString('hex');
// console.log('seed:'+seedHex);
// //生成root
// let root = bitcoin.HDNode.fromSeedHex(seedHex);
// console.log('xprv:'+root.toBase58());
// console.log('xpub:'+root.neutered().toBase58());
// //生成派生key
// let child0 = root.derivePath("m/44'/0'/0'/0/0");
// console.log("prv  m/44'/0'/0'/0/0 :"+child0.keyPair.toWIF());
// console.log("pub  m/44'/0'/0'/0/0 :"+child0.getAddress());