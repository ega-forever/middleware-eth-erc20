const _ = require('lodash'),
  amqp = require('amqplib'),
  net = require('net'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  contract = require('truffle-contract'),
  Web3 = require('web3'),
  config = require('./config'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.chronoErc20Processor'}),
  updateBalance = require('./services/updateBalance'),
  filterTxsBySMEventsService = require('./services/filterTxsBySMEventsService');

mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri, {useMongoClient: true});

const defaultQueue = 'app_eth.chrono_eth20_processor';
const erc20token = require('./build/contracts/TokenContract.json');
const smEvents = require('./controllers/eventsCtrl')(erc20token);

let init = async () => {
  let conn = await amqp.connect(config.rabbit.url);
  let channel = await conn.createChannel();

  let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
  const web3 = new Web3();
  web3.setProvider(provider);

  let Erc20Contract = contract(erc20token);
  Erc20Contract.setProvider(provider);

  try {
    await channel.assertExchange('events', 'topic', {durable: false});
    await channel.assertQueue(defaultQueue);
    await channel.bindQueue(defaultQueue, 'events', 'eth_transaction.*');
  } catch (e) {
    log.error(e);
    channel = await conn.createChannel();
  }

  channel.prefetch(2);
  channel.consume(defaultQueue, async (data) => {
    try {

      let blockHash = JSON.parse(data.content.toString());
      let tx = await Promise.promisify(web3.eth.getTransactionReceipt)(blockHash);
      let filtered = tx ? await filterTxsBySMEventsService(tx, web3, smEvents) : [];

      await Promise.all(
        _.map(filtered, (ev, index) => {
          if (!ev) return;
          updateBalance(Erc20Contract, tx.logs[index].address, ev.payload);
          ev.payload.save().catch(() => {
          });
        })
      );

    } catch (e) {
      log.error(e);
    }

    channel.ack(data);
  });
};

module.exports = init();
