const { overrideDevServer } = require('customize-cra');

module.exports = {
  devServer: overrideDevServer((config) => {
    config.allowedHosts = ['all'];
    config.host = '192.168.56.1';  
    return config;
  }),
};
