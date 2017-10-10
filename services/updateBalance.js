const _ = require('lodash'),
  accountModel = require('../models/accountModel');

const getBalance = async (instance, acc) => {
  const balance = await instance.balanceOf(acc);
  return balance.toNumber();
};

const updateBalance = async (Erc20Contract, erc20addr, payload) => {
  const from = _.get(payload, 'from') || _.get(payload, 'owner'),
    to = _.get(payload, 'to') || _.get(payload, 'spender'),
    instance = await Erc20Contract.at(erc20addr);

  for(let addr of [from, to]) {
    let obj = {};
    obj[`erc20token.${erc20addr}`] = await getBalance(instance, addr);
    await accountModel.update({address: addr}, {$set: obj});
  }
};
module.exports = updateBalance;
