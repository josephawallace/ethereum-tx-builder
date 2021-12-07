import { keccak256 } from '@ethersproject/keccak256';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import promptSync from 'prompt-sync';
import FaucetJSON from '../ERC20Faucet.json';

dotenv.config();

const prompt = promptSync();
const alchemyAPIKey = process.env.ALCHEMY_API_KEY;
const provider = new ethers.providers.AlchemyProvider('ropsten', alchemyAPIKey);
const faucetAddress = '0xFab46E002BbF0b4509813474841E0716E6730136';

// creates wallet from mnemonic
// const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
const mnemonic = 'because talent credit trust there degree fatal cupboard borrow point rabbit please';
const signer = ethers.Wallet.fromMnemonic(mnemonic, `m/44\'/60\'/0\'/0/0`);

prompt(`Address: ${signer.address}\nIn order to make transactions, the account must be funded with ETH. Use an ETH faucet on Ropsten testnet to do so (e.g. https://faucet.ropsten.be/). Press \'Enter\' to continue...`); // need ETH to cover gas costs. this does not give the account any of the ERC20 token

// creates a read-only abstraction of deployed ERC20 token contract
const faucet = new ethers.Contract(faucetAddress, FaucetJSON.abi, provider);

// creates an abstraction of deployed ERC20 token contract that can be interacted with on behalf of the signer
const faucetWithSigner = faucet.connect(signer);

// creates raw unsigned transaction to mint FAU tokens that will belong to signer
const amount = ethers.utils.parseEther(prompt('How much FAU token would you like in your account from the token faucet?'));
const transferData = await faucetWithSigner.populateTransaction.mint(signer.address, amount);
const gasFeeData = await provider.getFeeData();
const gasLimit = await faucet.estimateGas.mint(signer.address, amount);
const txData = {
    ...transferData, 
    type: 2, 
    nonce: await provider.getTransactionCount(signer.address),
    gasLimit: gasLimit,
    maxFeePerGas: gasFeeData.maxFeePerGas,
    maxPriorityFeePerGas: gasFeeData.maxPriorityFeePerGas,
    value: 0, // the contract does not need eth to make transfer of erc20; eth will only be paid in gas fees
    chainId: 3,
}
const unsignedTx = ethers.utils.serializeTransaction(txData);

// sign transaction
const unsignedTxParsed = ethers.utils.parseTransaction(unsignedTx);
const signedTx = await signer.signTransaction(unsignedTxParsed);

// send transaction on the network
await provider.sendTransaction(signedTx);
const txHash = keccak256(signedTx);
console.log(`Faucet has minted ${amount} FAU tokens to signer: https://ropsten.etherscan.io/tx/${txHash}`);