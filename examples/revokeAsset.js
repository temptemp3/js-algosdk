
// revoke assets

// See:
// https://developer.algorand.org/docs/features/asa/#revoking-an-asset
// https://github.com/algorand/docs/blob/master/examples/assets/v2/javascript/AssetExample.js

const algosdk = require('algosdk')

// Function used to wait for a tx confirmation
const waitForConfirmation = async function (algodclient, txId) {
    let response = await algodclient.status().do();
    let lastround = response["last-round"];
    while (true) {
        const pendingInfo = await algodclient.pendingTransactionInformation(txId).do();
        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
            //Got the completed Transaction
            console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
            break;
        }
        lastround++;
        await algodclient.statusAfterBlock(lastround).do();
    }
};

// Function used to print asset holding for account and assetid
const printAssetHolding = async function (algodclient, account, assetid) {
    // note: if you have an indexer instance available it is easier to just use this
    //     let accountInfo = await indexerClient.searchAccounts()
    //    .assetID(assetIndex).do();
    // and in the loop below use this to extract the asset for a particular account
    // accountInfo['accounts'][idx][account]);
    let accountInfo = await algodclient.accountInformation(account).do()
    for (idx = 0; idx < accountInfo['assets'].length; idx++) {
        let scrutinizedAsset = accountInfo['assets'][idx]
        if (scrutinizedAsset['asset-id'] == assetid) {
            let myassetholding = JSON.stringify(scrutinizedAsset, undefined, 2)
            console.log("assetholdinginfo = " + myassetholding)
            break
        }
    }
}

const main = async () => {

    let algodclient = new algosdk.Algodv2('','https://testnet.algoexplorerapi.io/', 443) // using testnet
    let assetID = YOUR_ASSET_ID
    let note = undefined
    let account_mnemonic = 'one mnemonic phrase'
    let recoveredAccount2 = algosdk.mnemonicToSecretKey(account_mnemonic)
    console.log(recoveredAccount2.addr)
    let recoveredAccount3Addr = 'one address'
    
    /*
     * params, transaction params (fee config, etc)
     */
    params = await algodclient.getTransactionParams().do();
    //comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    // The asset was also created with the ability for it to be revoked by 
    // the clawbackaddress. If the asset was created or configured by the manager
    // to not allow this by setting the clawbackaddress to "" then this would 
    // not be possible.
    // We will now clawback the 10 assets in account3. account2
    // is the clawbackaccount and must sign the transaction
    // The sender will be be the clawback adress.
    // the recipient will also be be the creator in this case
    // that is account3
    sender = recoveredAccount2.addr
    recipient = recoveredAccount2.addr
    revocationTarget = recoveredAccount3Addr
    closeRemainderTo = undefined;
    amount = 10; // some amount
    // signing and sending "txn" will send "amount" assets from "revocationTarget" to "recipient",
    // if and only if sender == clawback manager for this asset

    let rtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
        sender, // ok
        recipient,  // ok
        closeRemainderTo, // ok
        revocationTarget, // ok
        amount, // ok
        note, // ok
        assetID, // ok
        params // ok
    );
    // Must be signed by the account that is the clawback address    
    rawSignedTxn = rtxn.signTxn(recoveredAccount2.sk)
    let rtx = (await algodclient.sendRawTransaction(rawSignedTxn).do());
    console.log("Transaction : " + rtx.txId);
    // wait for transaction to be confirmed
    await waitForConfirmation(algodclient, rtx.txId);

    // You should now see 0 assets listed in the account information
    // for the third account
    console.log("Account 3 = " + recoveredAccount3Addr);
    await printAssetHolding(algodclient, recoveredAccount3Addr, assetID);
}
main()