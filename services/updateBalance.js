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

  return await Promise.all(
    [from, to].map(async function (address) {
      let obj = {};
      let balance = await getBalance(instance, address);
      obj[`erc20token.${erc20addr}`] = await getBalance(instance, address);
      await accountModel.update({address: address}, {$set: _.set({}, `erc20token.${erc20addr}`, balance)});
      return {address, balance};
    }));
};
module.exports = updateBalance;
