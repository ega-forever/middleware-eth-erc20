var Token = artifacts.require("./StandardToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
};
