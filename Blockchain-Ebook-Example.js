var crypto = require('crypto')
var ed25519 = require('ed25519')

var bobsPassword = 'This is my password, you don`t guess it!';
var hash = crypto.createHash('sha256').update(bobsPassword).digest();
var bobKeypair = ed25519.MakeKeypair(hash);

console.log(bobKeypair.privateKey);