<<<<<<< Updated upstream
# middleware-eth-erc20 [![Build Status](https://travis-ci.org/ChronoBank/middleware-eth-erc20.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-eth-erc20)

Middleware service for handling ERC20 emitted events on chronobank platform
=======
<<<<<<< Updated upstream
# middleware-eth-erc20
=======
# middleware-eth-erc20 [![Build Status](https://travis-ci.org/ChronoBank/middleware-eth-erc20.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-eth-erc20)

Middleware service for handling ERC20 token smart contracts
>>>>>>> Stashed changes

###Installation

This module is a part of middleware services. You can install it in 2 ways:

1) Through core middleware installer  [middleware installer](https://github.com/ChronoBank/middleware)
2) By hands: just clone the repo, do 'npm install', set your .env - and you are ready to go

#### About
This module is used for processing events, emitted on chronobank ERC20 smart contracts (see a description of accounts in [block processor](https://github.com/ChronoBank/middleware-eth-blockprocessor)).

#### How does it work

This how does it work:
1) This module load a sample contract (TokenContract) and use signatures for ERC20 token events;
2) Blockprocessor populate Ethtransactions collection with matched transactions by tx.to, tx.from, addresses from logs and EthAccounts.erc20token collection;
3) Erc20Processor listen to RabbitMQ "eth_transaction.\*" routing keys and filter out those txs which corresponds to the ERC20 tokens by signature in logs.topics[0];
4) Module extracts event's data from matched transactions and save it to DB (Transfers, Approvals collections for ERC20).
5) Moreover ERC20Processor push to the RabbitMQ ("eth_balance.${account.address}") and DB (EthAccounts.erc20token collection) any balance updates.

##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
MONGO_URI=mongodb://localhost:27017/data
RABBIT_URI=amqp://localhost:5672
SMART_CONTRACTS_EVENTS_TTL=0
TRANSACTION_TTL=0
NETWORK=development
```

The options are presented below:

| name | description|
| ------ | ------ |
| MONGO_URI   | the URI string for mongo connection
| RABBIT_URI   | rabbitmq URI connection string
| SMART_CONTRACTS_EVENTS_TTL   | how long should we keep events in db (should be set in seconds)
| TRANSACTION_TTL   | how long should we keep transactions in db (should be set in seconds)
| NETWORK   | network name (alias)- is used for connecting via ipc (see block processor section)

License
----

<<<<<<< Updated upstream
MIT
=======
MIT
>>>>>>> Stashed changes
>>>>>>> Stashed changes
