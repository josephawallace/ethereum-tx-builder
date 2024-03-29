# Ethereum HD Wallet Implementation

Creating HD Ethereum wallet with *ethers.js*.

## Generating addresses

The wallet uses the same process as defined in BIP39 to generate a mnemonic phrase that acts as a seed to generate addresses. Using the mnemonic, we can generate a public/private key pair that can be used to sign transactions.

### Derivation paths

For the HD wallet to create new addresses, the master public key, the master chain code, and the index of the address (end of the derivation path), are passed into the HMAC-SHA512 hash function. This produces a new 512 bit number that is now the child public key and child chain code. The parent private key can derive every child public key, thus proving ownership of the funds and having the ability to spend all of the funds in the hierarchy.

The HD wallet creates new unhardened child addresses using a parent public key, parent chain code, and the index of the new address (end of the relative derivation path). These three values are passed into the HMAC-SHA512 hash function, returning a 512-bit number that is split evenly into a child public key and child chain code. The combination of the public key and chain code is know as the xpub and can be used to derive more children.

The HD wallet can create hardened child addresses in a very similar way, but instead of passing the parent public key into the HMAC-SHA512 hash function, the parent private key is used. When the resulting 512 bits are split, half of the bits now represent a private key instead of a public key--the corresponding public key can be derived as usual using elliptic curve multiplication.

Hardened children "break" the line of the hierarchy by having their own private keys. While the top level private key can obviously be used to derive all necessary keys to spend all funds, by using a hardened child, the top level keys are less "exposed" in the sense that they are not used to receive or sign transactions. A leaked hardened child private key will only allow an adversary to spend the funds of children below it. Hardened children are marked with an apostrophe in the derivation path.

## Creating raw transaction

An Ethereum transaction takes different inputs than a Bitcoin transaction; most notably, there is no locking script. This is because Ethereum follows an account/balance paradigm, contrasting the UTXO model implemented in Bitcoin. Instead of balances being calculated by subtracting inputs and outputs, Ethereum nodes keep track of the network's state and debit/credit accounts on transactions. 

### Nonce

To avoid the same transaction being propagated through the network, a nonce is included in the transaction's data. The nonce is an attribute associated with an account; it begins at zero and is incremented by one for each of the account's transactions that is *confirmed* on the blockchain. This way, raw transaction hexes are unique. Transactions are eligible to be confirmed if the nonce is agreed to correctly reflect the number of transactions sent by the account. Otherwise, someone would be able to copy and resend a previous transaction until the originating address is drained of ether. 

### Chain ID

Without a chain ID, valid transactions created on any of the Ethereum testnets would also be considered valid on mainnet, allowing someone to spend "fake" funds in an actually consequential way. Similarly to how the nonce makes each transaction from an account unique, the chain ID makes each transaction on a specific chain from an account unique as well--protecting against relay attacks.