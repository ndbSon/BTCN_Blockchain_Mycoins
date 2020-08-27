var express = require('express');

var router = express.Router();
var randomstring = require("randomstring");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
var {Transaction, Blockchain} = require("../middlewares/blockchain");
var myChain = new Blockchain();


router.get('/', (req, res, next) => {
  res.render('home');
})


router.get('/info', (req, res, next) => {
  res.render('info');
})

router.post('/info', (req, res, next) => {
  var publicKey = req.body.address;
  var privateKey =req.body.password;
  var priKey = ec.keyFromPrivate(privateKey);
  if(priKey.getPublic('hex')==publicKey){
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
  }else{
    res.redirect("/info")
  }
 
})

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
  var pass= req.body.password;
 
  const myKey = ec.keyFromPrivate(pass);
  const tx1 = new Transaction(address1, address2, coin);
  tx1.signTransaction(myKey);
  myChain.addTransaction(tx1);
 
  console.log('Starting the miner:');
  myChain.minePendingTransactions("04a34cf3a472e099ccafcb75c85f07c5fd66df997480b58dd2246b934031ba9f3aaf0423fcff28ba202fd848eaef902ea7569658fd59e9e751ea207d533697e008");

  console.log('Starting the miner again!');
  myChain.minePendingTransactions("04a34cf3a472e099ccafcb75c85f07c5fd66df997480b58dd2246b934031ba9f3aaf0423fcff28ba202fd848eaef902ea7569658fd59e9e751ea207d533697e008");


  console.log('address2 is', myChain.getBalanceOfAddress(address2));
  console.log('address1 is', myChain.getBalanceOfAddress(address1));

  res.redirect('/transfer')
})

module.exports = router;
