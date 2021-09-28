
// recover accounts

// See:
// https://github.com/algorand/docs/blob/master/examples/assets/v2/javascript/AssetExample.js

const algosdk = require('algosdk')

const main = async () => {
    // recover accounts
    // paste in mnemonic phrases here for each account
    // Shown for demonstration purposes. NEVER reveal secret mnemonics in practice.
    // Change these values to use the accounts created previously.
    let account1_mnemonic = "your mnemonic phrase"

    let account1 = algosdk.mnemonicToSecretKey(account1_mnemonic)
    console.log(account1.addr)

    // Fund TestNet account
    console.log('Dispense funds to this account on TestNet https://bank.testnet.algorand.network/')
}
main()