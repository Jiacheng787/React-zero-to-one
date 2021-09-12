# 从零到一搭建 CLI 服务



最近自己在模仿  Vue-cli 搭建一个 CLI 服务，遇到了一些问题，这里记录一下。



## 1. 关掉 Webpack-dev-server 启动时打印的日志

相信自己配置过 `webpack-dev-server` 的小伙伴都知道，`webpack-dev-server` 启动的时候会打印日志信息：

```bash
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:9000/
<i> [webpack-dev-server] On Your Network (IPv4): http://197.158.164.104:9000/
<i> [webpack-dev-server] On Your Network (IPv6): http://[fe80::1]:9000/
<i> [webpack-dev-server] Content not from webpack is served from '/path/to/public' directory
```

但是 Vue-cli 在启动的时候并没有这些信息，只有打包编译完才会打印项目运行的 URL 地址。那么如何关掉这些日志呢？

在 Webpack 官网研究了一下 `DevServer` 的配置项，没有找到相关配置。然后又看了下 `Stats` 的配置，发现设置 `stats: 'none'` 也只是关闭了 Webpack 编译输出的信息，并不能关掉 `webpack-dev-server` 的日志信息。

那就直接深入源码研究一下。`webpack-dev-server` 的源码在：

> node_modules\webpack-dev-server\lib\Server.js

在里面搜一下关键字 `Project is running at` ，在 `1431` 行找到了如下内容：

```js
// node_modules/webpack-dev-server/lib/Server.js:1431
this.logger.info("Project is running at:");
```

看一下 `logger` 在哪里定义的：

```js
// node_modules/webpack-dev-server/lib/Server.js:176
if (!this.logger) {
  this.logger = this.compiler.getInfrastructureLogger("webpack-dev-server");
}
```

看这边调用了一个挂载在 `compiler` 对象上的 `getInfrastructureLogger` 方法，这边的 `compiler` 对象其实就是我们传进去的 `compiler` 实例：

```js
const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(options, compiler);
```

在 `Compiler` 模块搜一下这个方法的定义：

```js
// node_modules/webpack/lib/Compiler.js:286
getInfrastructureLogger(name) {
  return new Logger(
  	(type, args) => {
      // ...
      if (this.hooks.infrastructureLog.call(name, type, args) === undefined) {
        if (this.infrastructureLogger !== undefined) {
          this.infrastructureLogger(name, type, args);
        }
      }
    },
    // ...
  )
}
```

这边有一个 `Logger` 类，这个类相当于一个接口，没有具体的方法定义，具体打印日志的方法需要通过构造器的参数传进去。本人通过打断点调试，发现每次都会调用 `this.infrastructureLogger` 这个方法，而 `this.infrastructureLogger` 只有在类初始化的时候赋值为 `undefined` ，后面就没有再赋值了，说明应该是在类的外面创建 `compiler` 实例之后再挂载上去的。

全局搜一下 `infrastructureLogger` ，发现在 `NodeEnvironmentPlugin` 中用到了：

```js
// node_modules/webpack/lib/node/NodeEnvironmentPlugin.js:33
apply(compiler) {
  const { infrastructureLogging } = this.options;
  compiler.infrastructureLogger = createConsoleLogger({
    level: infrastructureLogging.level || "info",
    debug: infrastructureLogging.debug || false,
    console:
      infrastructureLogging.console ||
      nodeConsole({
        colors: infrastructureLogging.colors,
        appendOnly: infrastructureLogging.appendOnly,
        stream: infrastructureLogging.stream
      })
  });
  // ...
}
```

这边有一个 `createConsoleLogger` 方法，显然这个就是具体打印日志的方法，这边可以看到传入了一个配置项，其中就包含 `level` ，即日志级别。这边日志的级别是通过 `this.options.infrastructureLogging` 获取的，而这个 `this.options` 又是通过构造器参数传进来的，于是再全局搜一下 `NodeEnvironmentPlugin` ：

```js
// node_modules/webpack/lib/webpack.js:61
const createCompiler = rawOptions => {
	const options = getNormalizedWebpackOptions(rawOptions);
	applyWebpackOptionsBaseDefaults(options);
	const compiler = new Compiler(options.context);
	compiler.options = options;
	new NodeEnvironmentPlugin({
		infrastructureLogging: options.infrastructureLogging
	}).apply(compiler);
  // ...
}
```

可以看到传进去的 `infrastructureLogging` 是从这边的 `options` 获取的，而 `options` 又是通过 `getNormalizedWebpackOptions` 这个方法得到的，这个方法一看就是获取我们传入的 `webpack` 配置，下面 `applyWebpackOptionsBaseDefaults` 则是与 `webpack` 默认配置进行合并，得到最终配置，通过打断点也证实了这个猜测。

这样就好办了，我们只要在 `webpack` 配置中添加 `infrastructureLogging` 的配置就好了：

```js
module.exports = {
  // ...
  // 通过源码可以知道，level 的默认值是 'info'
  // 将日志级别设置为 'error' ，关掉 webapck-dev-server 启动打印的 info 日志
  infrastructureLogging: {
    level: 'error',
  },
}
```

再次启动项目，`webpack-dev-server` 就没有打印日志了。

后来想了想不对呀，这么重要的配置，文档不可能没有，又仔细找了下，在**其他选项**里面找到了：

> https://webpack.docschina.org/configuration/other-options/#infrastructurelogging

但是又想了下，如果不看源码，即使在文档中看到了这个配置项，应该很难猜到它的作用吧。

























