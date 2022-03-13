const Factory = artifacts.require("./Factory.sol");
//const Token = artifacts.require("./Token.sol");

module.exports = function(deployer) {
  deployer.deploy(Factory);
//  deployer.deploy(Token, 10000000);
};
