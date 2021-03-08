const 
	bitcoin = require('bitcoinjs-lib'),
	createHash = require('create-hash');

function standardHash(name,data){
	let h = createHash(name);
	return h.update(data).digest();
}