require('dotenv/config');

const config = require('../config'),
  expect = require('chai').expect,
  // awaitLastBlock = require('./helpers/awaitLastBlock'),
  // bytes32 = require('./helpers/bytes32'),
  net = require('net'),
  require_all = require('require-all'),
  contract = require('truffle-contract'),
  erc20contract = contract('../build/contracts/TokenContract.json'),
  _ = require('lodash'),
  Web3 = require('web3'),
  web3 = new Web3(),
  Promise = require('bluebird'),
  accountModel = require('../models/accountModel'),
  mongoose = require('mongoose');


describe('core/sc processor', function () {

  before(async () => {
    let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
    web3.setProvider(provider);
    mongoose.Promise = Promise;
    mongoose.connect(config.mongo.uri, {useMongoClient: true});
    erc20contract.setProvider(provider);

    // return await awaitLastBlock(web3);
  });

  after(() => {
    web3.currentProvider.connection.end();
    return mongoose.disconnect();
  });

  it('add account to mongo', async () => {
    let accounts = await Promise.promisify(web3.eth.getAccounts)();
    await new accountModel({address: accounts[0]}).save()
      .catch(err => console.error(err));
  });

});
