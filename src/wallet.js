import { keccak256 } from '@ethersproject/keccak256';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import promptSync from 'prompt-sync';

dotenv.config();

const prompt = promptSync();
const alchemyAPIKey = process.env.ALCHEMY_API_KEY;
const provider = new ethers.providers.AlchemyProvider('ropsten', alchemyAPIKey);

// creates wallet from mnemonic
// const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
const childNumber = 0;
const mnemonic = 'because talent credit trust there degree fatal cupboard borrow point rabbit please';
const signer = ethers.Wallet.fromMnemonic(mnemonic, `m/44\'/60\'/0\'/0/${childNumber}`);

prompt(`Address: ${signer.address}\nFund account using a Ropsten faucet (e.g. https://faucet.ropsten.be/). Press \'Enter\' to continue...`);

// creates unsigned transaction
const value = ethers.utils.parseEther(prompt('How much ether would you like to send? '));
const txData = {
    to: '0xcDA0D6adCD0f1CCeA6795F9b1F23a27ae643FE7C', // ropsten faucet (https://faucet.ropsten.be/)
    nonce: await provider.getTransactionCount(signer.address), // protect against relay attack
    gasLimit: 21000, // gas limit of standard ethereum transfer
    data: '',
    value: value,
    chainId: 3,
}; // gasPrice, maxFeePerGas, maxPriorityFeePerGas are left unspecified - ethers determines these values from the network
const unsignedTx = ethers.utils.serializeTransaction(txData); // serializes txData

// sign transacton
let { v, r, s, ...unsignedTxParsed } = ethers.utils.parseTransaction(unsignedTx);
const signedTx = await signer.signTransaction(unsignedTxParsed);
const txHash = keccak256(signedTx);
// console.log(`Signed transaction hex: ${signedTx}`);

// broadcast transaction
const response = await provider.sendTransaction(signedTx);
console.log(response);
console.log(signedTx);
console.log(`https://ropsten.etherscan.io/tx/${txHash}`);


