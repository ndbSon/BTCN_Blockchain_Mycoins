var express = require('express');

var router = express.Router();
var randomstring = require("randomstring");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

var myChain = new Blockchain();


router.get('/', (req, res, next) => {
  res.render('home');
})


router.get('/info', (req, res, next) => {
  res.render('info');
})

router.post('/info', (req, res, next) => {
  var address = req.body.address;
  var coin = myChain.getBalanceOfAddress(address);
  var transfers=[];
  for(const block of myChain.chain){
    for(const trans of block.transactions){
        // Nếu address cần kiểm tra số dư là người gửi, hãy giảm balance
        if(trans.fromAddress === address){
           transfers.push(trans);
        }
        // Nếu address cần kiểm tra số dư là người nhận, hãy tăng balance
        if(trans.toAddress === address){
            transfers.push(trans);
        }
    }
  }
  res.render('infodetail',{coin,address,transfers})
})

// router.get('/infodetail', (req, res, next) => {
//   res.render('infodetail',{coin,address});
// })

router.get('/transfer', (req, res, next) => {
  res.render('transfer');
})



router.get('/history', (req, res, next) => {
  var transfers=[];
  for(const block of myChain.chain){
    for(const trans of block.transactions){
      transfers.push(trans)
    }
  }
  res.render('history',{transfers});
})

router.post('/wallet', (req, res, next) => {

  const key = ec.genKeyPair();
  const publicKey = key.getPublic('hex');
  const privateKey = key.getPrivate('hex');

  var coin = myChain.getBalanceOfAddress(publicKey);

  var transfers=[];
  for(const block of myChain.chain){
    for(const trans of block.transactions){
        // Nếu address cần kiểm tra số dư là người gửi, hãy giảm balance
        if(trans.fromAddress === publicKey){
           transfers.push(trans);
        }
        // Nếu address cần kiểm tra số dư là người nhận, hãy tăng balance
        if(trans.toAddress === publicKey){
            transfers.push(trans);
        }
    }
  }
  res.render('infodetail',{coin,publicKey,transfers,privateKey})
})

router.post('/transfer', (req, res, next) => {
  var address1 = req.body.address1;
  var address2 = req.body.address2;
  var coin = +req.body.coin;
 
  myChain.createTransaction(new Transaction(address1, address2, coin));
 
  console.log('Starting the miner:');
  myChain.minePendingTransactions('myAddress');

  // console.log('Balance of my address is', myChain.getBalanceOfAddress('myAddress'));

  console.log('Starting the miner again!');
  myChain.minePendingTransactions("myAddress");

  // console.log('Balance of my address is', myChain.getBalanceOfAddress('myAddress'));
  // console.log('address2 is', myChain.getBalanceOfAddress(address2));
  // console.log('address1 is', myChain.getBalanceOfAddress(address1));

  res.redirect('/transfer')
})

module.exports = router;
