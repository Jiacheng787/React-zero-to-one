const chalk = require('chalk');
const internalIp = require('internal-ip');

class DevServerBuiltPlugin {
  constructor(localIp, port) {
    this.localIp = (localIp === 'localhost' ? '127.0.0.1' : localIp);
    this.networkIp = internalIp.v4.sync();
    this.port = port;
  }

  localURL() {
    return `${this.localIp}:${this.port}`;
  }

  networkURL() {
    return `${this.networkIp}:${this.port}`;
  }

  apply(compiler) {
    compiler.hooks.done.tap('DevServerBuiltPlugin', stats => {
      if (stats.hasErrors()) return;
      console.log();
      console.log(`  App running at:`);
      console.log(`  - Local:   ${chalk.cyan(this.localURL())}`);
      console.log(`  - Network: ${chalk.cyan(this.networkURL())}`);
      console.log();
    })
  }
}

module.exports = DevServerBuiltPlugin;