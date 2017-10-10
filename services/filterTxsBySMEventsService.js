const _ = require('lodash'),
  solidityEvent = require('../node_modules/web3/lib/web3/event.js'),
  config = require('../config');

module.exports = async (tx, web3, smEvents) => {

  if (_.get(tx, 'logs', []).length === 0)
  {return [];}
  
  // console.log('smEvents >',require('util').inspect(smEvents.signatures, { showHidden: true, depth: null }));
  // console.log('tx >',require('util').inspect(tx, { showHidden: true, depth: null }));

  return _.chain(tx.logs)
    .map(ev => {
      let signatureDefinition = smEvents.signatures[ev.topics[0]];

      if (!signatureDefinition)
      {return;}

      _.pullAt(ev, 0);
      let resultDecoded = new solidityEvent(null, signatureDefinition).decode(ev);

      // console.log('resultDecoded >', resultDecoded);
      
      return _.chain(resultDecoded)
        .pick(['event', 'args'])
        .merge({args: {controlIndexHash: `${ev.logIndex}:${ev.transactionHash}:${web3.sha3(config.web3.network)}`}})
        .thru(ev => ({
          name: ev.event,
          payload: new smEvents.eventModels[ev.event](_.merge(ev.args, {network: config.web3.network}))
        }))
        .value();
    })
    .value();

};
