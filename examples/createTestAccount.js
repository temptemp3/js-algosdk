
// create accounts

const algosdk = require('algosdk');

let account = algosdk.generateAccount();
console.log("Account Address: ", account.addr);

let mn = algosdk.secretKeyToMnemonic(account.sk);
console.log("Account Mnemonic: ", mn);
