const SHA256 = require("crypto-js/sha256");
class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    calculateHash() {
        return crypto.createHash('sha256').update(this.previousHash +
            this.timestamp + JSON.stringify(this.transactions) +
            this.nonce).digest('hex');
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("BLOCK MINED: " + this.hash);
    }

}
class Blockchain {
    constructor() {
        this.chain = [this.createFirstBlock()];
        this.difficulty = 4;

        // Nơi lưu trữ các transaction đang chờ được xữ lý để đưa vào block
        this.pendingTransactions = [];

        // Số coin mà miner sẽ nhận được sau khi đào được block
        this.miningReward = 10;
    }



    createFirstBlock() {
        return new Block("01/06/2020", "baoson", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    createTransaction(transaction) {
        // Sẽ có một vài validate transaction ở đây

        // Đẩy transaction vào mãng pendingTransactions
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(miningRewardAddress) {

        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        // Tạo một block mới với tất cả các transaction pending và đào nó
        let block = new Block(Date().toString(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        // Thêm block vừa được đào vào chuỗi
        this.chain.push(block);

    }
    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        // Verify the transactiion
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }

        // Making sure that the amount sent is not greater than existing balance
        if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
            throw new Error('Not enough balance');
        }

        this.pendingTransactions.push(transaction);
        // debug('transaction added: %s', transaction);
    }


    getBalanceOfAddress(address) {
        let balance = 0;

        // Lặp qua từng block và các transaction bên trong một block

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                // Nếu address cần kiểm tra số dư là người gửi, hãy giảm balance
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                // Nếu address cần kiểm tra số dư là người nhận, hãy tăng balance
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }


        return balance;
    }

    isChainValid() {
        // Check if the Genesis block hasn't been tampered with by comparing
        // the output of createGenesisBlock with the first block on our chain
        const realGenesis = JSON.stringify(this.createGenesisBlock());

        if (realGenesis !== JSON.stringify(this.chain[0])) {
            return false;
        }

        // Check the remaining blocks on the chain to see if there hashes and
        // signatures are correct
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
        }

        return true;
    }
}


class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.date = Date.now().toString();
    }
    calculateHash() {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
    }
    signTransaction(signingKey) {
        // You can only send a transaction from the wallet that is linked to your
        // key. So here we check if the fromAddress matches your publicKey
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');

        this.signature = sig.toDER('hex');
    }
    isValid() {
        // If the transaction doesn't have a from address we assume it's a
        // mining reward and that it's valid. You could verify this in a
        // different way (special field for instance)
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

module.exports = {
    Blockchain,
    Block,
    Transaction
};

