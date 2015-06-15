
// Example usage: Name Registry
// Create the contract, register the key 123, set the value 456

var web3 = require('web3')
var lw = require('ethlightjs')
var keystore = lw.keystore
var txutils = lw.txutils

web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));

var source = '\ncontract NameCoin {\n\n    struct Item {\n\taddress owner;\n\tuint value;\n    }\n\n    mapping (uint => Item) registry;\n\n    function register(uint key) {\n\tif (registry[key].owner == 0) {\n\t    registry[key].owner = msg.sender;\n\t}\n    }\n\n    function transferOwnership(uint key, address newOwner) {\n\tif (registry[key].owner == msg.sender) {\n\t    registry[key].owner = newOwner;\n\t}\n    }\n\n    function setValue(uint key, uint newValue) {\n\tif (registry[key].owner == msg.sender) {\n\t    registry[key].value = newValue;\n\t}\n    }\n\n    function getValue(uint key) constant returns (uint value) {\n\treturn registry[key].value;\n    }\n\n    function getOwner(uint key) constant returns (address owner) {\n\treturn registry[key].owner;\n    }\n}\n'

//var privkey = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
//keystore.addPrivateKey(privkey, 'mypassword')

var seed = 'unhappy nerve cancel reject october fix vital pulse cash behind curious bicycle'
keystore.setSeed(seed, 'mypassword')

var sendingAddr = keystore.getAddresses()[0]
console.log(sendingAddr)
var nonce = web3.eth.getTransactionCount('0x' + sendingAddr)
console.log('Nonce: ' + nonce)
var code = web3.eth.compile.solidity(source).slice(2)

txOptions = {
    gasPrice: 10000000000000,
    gasLimit: 3000000,
    value: 10000000,
    nonce: nonce,
    data: code
}

var contractData = txutils.createContractTx(sendingAddr, txOptions)
var signedTx = keystore.signTx(contractData.tx, 'mypassword', sendingAddr)

// inject signedTx into network...
console.log('Contract creation TX: ' + signedTx)
console.log('Contract Address: ' + contractData.addr)

// contract json abi, this is autogenerated using solc CLI
var abi = [{"constant":true,"inputs":[{"name":"key","type":"uint256"}],"name":"getValue","outputs":[{"name":"value","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"key","type":"uint256"},{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"key","type":"uint256"},{"name":"newValue","type":"uint256"}],"name":"setValue","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"key","type":"uint256"}],"name":"getOwner","outputs":[{"name":"owner","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"key","type":"uint256"}],"name":"register","outputs":[],"type":"function"}]

// TX to register the key 123
txOptions.to = contractData.addr
txOptions.nonce += 1
var registerTx = txutils.functionTx(abi, 'register', [123], txOptions)
var signedRegisterTx = keystore.signTx(registerTx, 'mypassword', sendingAddr)

// inject signedRegisterTx into the network...
console.log('Register key: ' + signedRegisterTx)

// TX to set the value corresponding to key 123 to 456
txOptions.nonce += 1
var setValueTx = txutils.functionTx(abi, 'setValue', [123, 456], txOptions)
var signedSetValueTx = keystore.signTx(setValueTx, 'mypassword', sendingAddr)

// inject signedSetValueTx into the network...
console.log('SetValueTx: ' + signedSetValueTx)

// Send a value transaction
txOptions.nonce += 1
txOptions.value = 1000000000000000000
txOptions.data = undefined
txOptions.to = 'eba8cdda5058cd20acbe5d1af35a71cfc442450e'
var valueTx = txutils.valueTx(txOptions)

var signedValueTx = keystore.signTx(valueTx, 'mypassword', sendingAddr)
console.log('Value TX: ' + signedValueTx)

// Check that the owner is sendingAddr
var contractAddr = contractData.addr
var myContract = web3.eth.contract(abi).at('0x' + contractAddr)
var owner = myContract.getOwner(123)
console.log('Owner: ' + owner)

// Check the value of key 123
var val = myContract.getValue(123)
console.log('Value: ' + val)
