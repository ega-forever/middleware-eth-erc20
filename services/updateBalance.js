const _ = require('lodash'),
  accountModel = require('../models/accountModel');

const getAddress = (tx, payload) => {
  const index = payload.controlIndexHash.split(':')[0];
  return tx.logs[index].address;
};

const getBalance = async (instance, acc) => {
  const balance = await instance.balanceOf(acc);
  return balance.toNumber();
};

const updateBalance = async (erc20instance, tx, payload) => {
  const from = _.get(payload, 'from') || _.get(payload, 'owner'),
        to = _.get(payload, 'to') || _.get(payload, 'spender'),
        erc20addr = getAddress(tx, payload),
        instance = await erc20instance.at(erc20addr);

  const dbUpdates = _.chain([from, to])
    .map(async (addr) => {
      let obj = {};
      const balance = await getBalance(instance, addr);

      obj[`erc20token.${erc20addr}`] = balance;

      return accountModel.update({address: addr}, {$set: obj});
    })
    .value();

  Promise.all(dbUpdates)
};
module.exports = updateBalance;