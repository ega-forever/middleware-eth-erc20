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

  const zz = _.chain([from, to])
    .map(async acc => {
      let obj = {};
      const balance = await getBalance(erc20instance, acc);
      obj[getAddress(tx, payload)] = balance;
      await accountModel.update({address: acc}, {erc20token: obj});
    });
};
module.exports = updateBalance;