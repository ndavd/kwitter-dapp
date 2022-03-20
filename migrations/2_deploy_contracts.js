const Kwitter = artifacts.require("Kwitter");

module.exports = function (deployer) {
  deployer.deploy(Kwitter);
};
