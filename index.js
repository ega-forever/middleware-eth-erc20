const contract = require('truffle-contract'),
  config = require('./config');
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  transactionModel = require('./models/transactionModel'),
  filterTxsBySMEventsService = require('./services/filterTxsBySMEventsService'),
  net = require('net'),
  Web3 = require('web3'),
  amqp = require('amqplib');

const defaultQueue = 'app_eth.chrono_eth20_processor';
mongoose.Promise = Promise;
mongoose.connect(config.mongo.uri, {useMongoClient: true});

let init = async () => {
  let conn = await amqp.connect(config.rabbit.url);
  let channel = await conn.createChannel();

  let provider = new Web3.providers.IpcProvider(config.web3.uri, net);
  const web3 = new Web3();
  web3.setProvider(provider);

 try {
    await channel.assertExchange('events', 'topic', {durable: false});
    await channel.assertQueue(defaultQueue);
    await channel.bindQueue(defaultQueue, 'events', 'eth_transaction.*');
  } catch (e) {
    log.error(e);
    channel = await conn.createChannel();
  }

  const parseJson = async function(data) {
    return JSON.parse(data);
  };

  channel.consume(defaultQueue, async (data) => {
    let blockPayload;
    channel.ack(data);

    blockPayload = await parseJson(data.content.toString());

    let tx = await transactionModel.findOne({payload: blockPayload});

    if (!tx)
    {return;}

    let filtered = await filterTxsBySMEventsService(tx, web3, multiAddress, smEvents);

    if(tx.logs.length >0) {
      console.log(tx.logs[0].topics)
    }
  });
};

module.exports = init();