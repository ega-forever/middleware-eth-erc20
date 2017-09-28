const contract = require('truffle-contract'),
  config = require('./config'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  accountModel = require('./models/accountModel'),
  transactionModel = require('./models/transactionModel'),
  filterTxsBySMEventsService = require('./services/filterTxsBySMEventsService'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.chronoErc20Processor'}),
  net = require('net'),
  Web3 = require('web3'),
  amqp = require('amqplib');

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

  try {
    await channel.assertExchange('events', 'topic', {durable: false});
    await channel.assertQueue(defaultQueue);
    await channel.bindQueue(defaultQueue, 'events', 'eth_transaction.*');
  } catch (e) {
    log.error(e);
    channel = await conn.createChannel();
  }

  let Erc20Contract = contract(erc20token);
  Erc20Contract.setProvider(provider);
  
  let erc20address = await Erc20Contract.deployed()
    .then(res => res.address)
    .catch(err => {
      log.error('smart contract are not deployed!', err);
      return process.exit(1);
    });
  
  await accountModel.update({address: erc20address}, {$set: {address: erc20address}}, {
    upsert: true,
    setDefaultsOnInsert: true
  });

  const parseJson = async function (data) {
    return JSON.parse(data);
  };

  channel.consume(defaultQueue, async (data) => {
    let blockPayload;
   // channel.ack(data);

    blockPayload = await parseJson(data.content.toString())
      .catch(err => log.error(err));

    let tx = await transactionModel.findOne({payload: blockPayload});

    if (!tx)
    {return;}

    let filtered = await filterTxsBySMEventsService(tx, web3, smEvents);

    // save ETC20 Events to DB
    await Promise.all(
      filtered.map(ev => {
        if (!ev) {return;}
        ev.payload.save().catch(() => {});
      })
    );

    if(tx.logs.length >0) {
      log.info(tx.logs[0].topics);
    }
  });
};

module.exports = init();
