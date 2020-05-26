var express = require('express');


var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
require('./middlewares/view-engine')(app);

require('./middlewares/blockchain');
var { Blockchain, Block } = require("./middlewares/blockchain");

// let myChain = new Blockchain();
// myChain.addBlock(new Block(1, "20/07/2018", "block 2"));
// myChain.addBlock(new Block(2, "20/07/2018", "block 3"));

// console.log(JSON.stringify(myChain, null, 4));

app.use('/', require('./routes/blockchain.route'))


app.listen(3000, () => {
    console.log('server is running at http://localhost:3000');
})