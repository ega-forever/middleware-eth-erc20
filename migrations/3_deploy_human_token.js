var Token = artifacts.require("./HumanStandardTokenFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
};
