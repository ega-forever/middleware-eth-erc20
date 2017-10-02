const _ = require('lodash'),
  accountModel = require('../models/accountModel');

const getAddress = (tx, payload) => {
  const index = payload.controlIndexHash.split(':')[0];
  return tx.logs[index].address;
};

const getBalance = async (erc20instance, acc) => {
  const balance = await erc20instance.balanceOf(acc);
  return balance.toNumber();
};

const updateBalance = async (erc20instance, tx, payload) => {
  const from = _.get(payload, 'from') || _.get(payload, 'owner');
  const to = _.get(payload, 'to') || _.get(payload, 'spender');

  const dbUpdates = _.chain([from, to])
    .map(async (addr) => {
      let obj = {};
      const balance = await getBalance(erc20instance, addr);

      obj[getAddress(tx, payload)] = balance;

      return accountModel.update({address: addr}, {$set: {erc20token: obj}});
    })
    .value();

  Promise.all(dbUpdates)
};
module.exports = updateBalance;