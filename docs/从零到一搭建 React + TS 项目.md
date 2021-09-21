# React-zero-to-one

从零到一搭建 React + TS 项目。



## 一、基础环境搭建



### 1) 确认 Node.js 环境

Node.js 环境是前端之源，如果没有 Node 就没有各种构建环境、本地开发服务器、依赖库管理等。相信每一位前端同学一定都安装了 Node.js ，只不过需要检查一下，安装的 Node 版本是否为 LTS 版本。

简单来说，Node 的主版本分为**奇数版本**和**偶数版本**，每个版本发布之后会持续六个月的时间，六个月之后，奇数版本将变为 EOL (End-Of-Life version) 状态，不再支持，只有偶数版本会变成 Active LTS (long-term support) 状态并且长期支持，这意味着重大的 bug 将在后续的 30 个月内持续得到不断地修复。因此我们在生产环境使用 Node 的时候，应该尽量使用它的 LTS 版本。



### 2) 初始化项目

新建一个目录然后执行下面的命令初始化项目：

```bash
$ npm init -y
```



### 3) 安装并配置 Webpack

前端不断发展，但很多特性浏览器不一定会支持，`ES6` 模块，`CommonJs` 模块、`Scss/less` 、`jsx` 等等，通过 Webpack 我们可以将所有文件进行打包、压缩混淆，最终转换为浏览器识别的代码。

除了安装 Webpack ，我们需要安装对应的命令行工具 `webpack-cli` ，以及实现了热加载，也就是自动监听我们文件变化然后刷新网页的 `webpack-dev-server` 。

由于这些工具只在开发阶段使用，所以我们安装的时候可以加上 `-D(--save-dev)` 命令进行区分。

```bash
$ npm i webpack webpack-cli webpack-dev-server -D
```

> `webpack-cli` 最好跟 `webpack` 一起安装，单独安装容易出现版本冲突问题

接下来在根目录新建 `webpack.config.js` 进行项目的配置，主要配置入口文件，打包输目录，以及 `devServer` ：

```js
const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    // [hash] 在 Webpack 5 中已经废弃了
    // 可以使用 fullhash、chunkhash 或者 contenthash
    filename: '[contenthash].bundle.js',
  },
  devServer: {
    // 在 Webpack 5 中不再使用 contentBase 和 publicPath ，改成了 static
    static: path.resolve(__dirname, './dist'),
    compress: true,
    hot: true,
    open: true,
    host: 'localhost',
    port: '8066'
  },
  plugins: [
    // new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './public/index.html'),
      title: "react-zero-to-one",
      filename: "index.html",
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      }
    })
  ]
}
```

接下来在建一个 `src` 目录，创建 `index.js` ，随便写点内容：

```js
const div = document.createElement("div");
div.innerHTML = "测试内容";
document.body.appendChild(div);
```

再创建一个 `public` 目录，用来放 HTML 文件模板：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

然后在 `package.json` 中添加两个 npm script ：

```json
"scripts": {
  "dev": "npx webpack-dev-server --mode development --open",
  "build": "npx webpack --mode production"
}
```

最后执行命令：

```bash
$ npm run dev
```

可以看到项目正常启动。



### 4) 安装 React

React 可以让我们专注于构建用户界面，而不需要再手动维护 dom 元素的更新，当然还可以用 Vue 。

安装核心库 `react` ，以及渲染 Web 的 `react-dom` ：

```bash
$ npm i react react-dom
```

修改 `src/index.js` 的内容如下：

```js
import React from 'react';
import ReactDOM from 'react-dom';

class Hello extends React.Component {
  render() {
    return React.createElement('div', null, `Hello ${this.props.toWhat}`);
  }
}

ReactDOM.render(
  React.createElement(Hello, { toWhat: 'World by React' }, null),
  document.getElementById('app')
)
```

再次启动项目，可以看到正常运行，但是如果我们将上述文件改为 JSX 语法，就发现报错了：

```js
import React from 'react';
import ReactDOM from 'react-dom';

class Hello extends React.Component {
  render() {
    return <div>Hello {this.props.toWhat}</div>;
  }
}

ReactDOM.render(
  <Hello toWhat="World by jsx" />,
  document.getElementById('app')
)
```

> Module parse failed: Unexpected token (6:11)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders

这是因为 JSX 是一个编译时的语法糖，需要经过 babel 编译，下面就来配置 babel 。



### 5) 安装并配置 Babel

`babel` 可以为我们把各种语法、新功能转换为浏览器所能识别的 `js` ，`.jsx` 文件就可以通过 `babel` 进行转换。

> `.jsx` 实际上和 `.vue` 类似，在开发阶段通过 IDE 进行语法支持，打包编译阶段通过专门的 loader 去编译

这里我们先安装一下 `babel` 以及在 webpack 中使用的 `babel-loader` ：

```bash
$ npm i @babel/core babel-loader -D
```

> Babel 采用**微内核**架构，核心功能非常小，大部分功能都是通过插件扩展进行实现的。`@babel/core` 就是微内核架构中的内核，主要处理这些任务：
>
> - 加载并处理配置；
> - 加载插件；
> - 将代码通过 parse 转换成 AST ；
> - 调用 Traverser 遍历整个 AST ，并使用**访问者模式**对 AST 进行转换；
> - 生成代码，包括 SourceMap 转换和源代码生成；
>
> Babel  的运行分为三个阶段：解析、转换、生成。自 Babel 6.0 起，就不再对代码进行 `transform` ，只负责 `parse` 和 `generate` 的过程，代码的 `transform` 过程全部交给一个个 `plugin` 去做。因此，在没有配置任何 `plugin` 的情况下，经过 `babel` 输出的代码是没有改变的。

然后在 webpack 中引入 `babel-loader` ，用来对 `js` 进行转换，更改 webpack.config.js 文件，添加一个配置：

```js
module: {
  rules: [
    {
      test: /\.(js)x?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    },
  ],
},
```

然后我们来安装 `@babel/preset-react` 来转换 `jsx` 语法：

```bash
$ npm i @babel/preset-react -D
```

在根目录新建 `babel` 的配置文件 `babel.config.js` ：

```js
module.exports  = {
  presets: [
    "@babel/preset-react"
  ]
}
```

> Babel 7.x 以上可以直接使用 `babel.config.js` ，也可以用 `json` 配置文件

再次运行项目就可以正常使用 JSX 了。

实际上 Babel 最初是设计用来将 ECMAScript 2015+ 的代码转换成后向兼容的代码，主要工作就是**语法转换**和 **polyfill** 。

有的环境下可能需要转换几十种不同语法的代码，则需要配置几十个`plugin`，这显然会非常繁琐。所以，为了解决这种问题，`babel`提供了预设插件机制`preset`，`preset`中可以**预设置一组插件来便捷的使用这些插件所提供的功能**。目前，`babel`官方推荐使用`@babel/preset-env`预设插件。

`@babel/preset-env`主要的作用是用来转换那些已经被**正式纳入`TC39`中的语法**。所以它无法对那些还在提案中的语法进行处理，对于处在`stage`中的语法，需要安装对应的`plugin`进行处理。

除了语法转换，`@babel/preset-env`另一个重要的功能是**对`api`的处理，也就是在代码中引入`polyfill`**。例如浏览器环境不支持 Promise ，就可以通过引入 polyfill 来实现 Promise 。`@babel/preset-env`主要是依赖`core-js`来处理`api`的兼容性，所以需要事先安装`core-js`。当设置了`useBuiltIns`选项（不为`false`）时，就会使用`core-js`来对`api`进行处理。

```bash
$ npm i @babel/preset-env core-js -D
```

然后我们再修改下 `babel` 的配置：

```js
module.exports = {
  "presets": [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: 3
      }
    ],
    "@babel/preset-react"
  ],
  "plugins": []
}
```

[前端工程化（7）：你所需要知道的最新的babel兼容性实现方案](https://juejin.cn/post/6976501655302832159)



### 6) 将 babel helper 函数统一引入

通过观察打包后的 `App.tsx` 文件（没有开启 `sourceMap`），可以发现 `babel` 在编译阶段注入了很多 helper 函数，这样就会存在一个问题，在正常的前端项目里面会涉及大量的组件，如果每个组件文件里面都单独注入 helper 函数，会导致打包后的文件体积变得很大：

<img src="README.assets/Screen Shot 2021-08-26 at 7.20.45 PM.png" alt="Screen Shot 2021-08-26 at 7.20.45 PM" style="zoom:50%;" />

一种解决思路是将这些函数声明都放在一个 npm 包里面，然后使用的时候从包里面引入。`@babel/runtime` 就是上面说的这个包，把所有语法转换用到的辅助函数集成到了一起：

<img src="README.assets/Screen Shot 2021-08-26 at 7.41.36 PM.png" alt="Screen Shot 2021-08-26 at 7.41.36 PM" style="zoom:50%;" />

那么只要将语法转换后的 helper 函数声明手动替换成 `require("@babel/runtime/helpers/...")` 的形式就可以了。 但是这些 helper 函数如果一个个记住并手动引入，会增加很多工作量，这时候可以用 `@babel/plugin-transform-runtime` 这个插件来解决问题：

```bash
$ npm i @babel/plugin-transform-runtime -D
```

> 确保已经装了 `@babel/runtime` ，可以到 `node_modules` 里面看下

然后修改 `babel.config.js` 如下：

```js
module.exports = {
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: 3
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    [
      "import",
      {
        libraryName: "antd",
        style: 'css'
      }
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
        helpers: true,
        regenerator: true,
        useESModules: true,
      },
    ],
  ]
}
```

再次运行项目，报了几个错误：

> Can't resolve '@babel/runtime-corejs3/helpers/esm/classCallCheck'

报错的原因应该跟配置有关系，我们在 `babel.config.js` 里面配置的是 `corejs: 3` ，然后 `@babel/plugin-transform-runtime` 没有去 `@babel/runtime` 里面找，而是到了 `@babel/runtime-corejs3` 里面去找。那就按照提示装一下：

```bash
$ npm i @babel/runtime-corejs3 -D
```

> 安装过程中出现了 `core-js` 安装的提示，貌似 `core-js` 不用单独安装

再次编译之后可以发现，helper 函数都改为统一引入的形式了。



### 7) Babel 编译提案阶段语法

前面提到 `@babel/preset-env` 只编译被正式纳入 TC39 的语法特性，不能编译提案阶段的语法。但实际上很多提案阶段的语法已经被广泛使用了，例如装饰器 `@` 、可选链 `?.` 、空值合并运算符 `??` ，为了让 Babel 编译这些语法，可以使用额外的插件：

> https://babeljs.io/docs/en/plugins-list

在 TypeScript 项目中通常会安装如下插件，不过里面大部分已经纳入了 TC39 ，只要安装最新版本的 `@babel/preset-env` 就可以了，不用单独安装：

```js
// 装饰器语法 `@`，还在提案阶段
@babel/plugin-proposal-decorators
// 可选链操作符 `?.`，ES2020 语法
@babel/plugin-proposal-optional-chaining
// 空值合并运算符 `??`，ES2020 语法
@babel/plugin-proposal-nullish-coalescing-operator
// 动态引入 `import()`，ES2020 语法
@babel/plugin-syntax-dynamic-import
// 将 ES2017 async 函数编译为 ES2015 generator
@babel/plugin-transform-async-to-generator
// ES2015 generator 降级处理
@babel/plugin-transform-regenerator
// 对象展开，ES2018 语法
@babel/plugin-proposal-object-rest-spread
// 类属性，ES2022 语法
@babel/plugin-proposal-class-properties
```

因此这边实际上只需要装 `decorator` 插件就可以：

```bash
$ npm i @babel/plugin-proposal-decorators -D
```

需要注意几个问题：

动态引入 `import()` 插件不包含 `Promise` 的实现，如果在不支持 `Promise` 的环境使用，则需要引入 `Promise` 和 `Iterator` 的 polyfill ；

ES2015 的展开运算符实际上只适用于展开到数组的情形，并且内部是基于 `for...of` 迭代，因此被展开的也必须是可迭代对象（实现了 `Iterator` 接口的对象，例如数组、字符串、`Set` 、`Map`）。直到 ES2018 才将展开运算符扩充到对象使用，允许将普通对象或者可迭代对象展开到一个普通对象内，但是注意普通对象仍然不能展开到数组（因为普通对象没有实现 `Iterator` 接口）。

类属性语法，Babel 官网有一个例子：

```js
class Bork {
  //Property initializer syntax
  instanceProperty = "bork";
  boundFunction = () => {
    return this.instanceProperty;
  };

  //Static class properties
  static staticProperty = "babelIsCool";
  static staticFunction = function() {
    return Bork.staticProperty;
  };
}
```

无论是实例属性/方法，还是静态属性/方法都会被转换。需要注意的是，这边的实例属性/方法，会作为对象的自有属性，不会挂载到原型上：

```js
let myBork = new Bork();

//Property initializers are not on the prototype.
console.log(myBork.__proto__.boundFunction); // > undefined
```

> 相当于在类的 `constructor` 内部初始化，只不过写法更简洁，配合 TS 使用更佳

然后我们修改 `babel.config.js` 如下：

```js
module.exports = {
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: 3
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    // antd 按需引入
    [
      "import",
      {
        libraryName: "antd",
        style: 'css'
      }
    ],
    // 将 babel helper 函数统一引入
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
        helpers: true,
        regenerator: true,
        useESModules: true,
      },
    ],
    // 编译提案阶段语法
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ]
  ]
}
```



### 8) @babel/preset-module

这边的内容参考了卡老师的文章：

[Chrome团队：如何曲线拯救KPI](https://juejin.cn/post/6989235408970186783)

我们知道 `@babel/preset-env` 是根据 `target` 中配置的目标浏览器版本，将 ES 新语法编译为 ES5 语法。但是这样的编译是有代价的，就是编译之后代码量激增。

事实上，某些高级语法，现代浏览器可能或多或少已经支持了，只是支持度不好。

所以，一个更好的思路是：**将不支持的语法替换为已支持的语法**，这样就能省去特性实现这部分代码。

![Screen Shot 2021-08-29 at 4.19.26 PM](README.assets/Screen Shot 2021-08-29 at 4.19.26 PM.png)

这种浏览器间差异带来的优化空间，`Babel`团队很难独自完成。所以，`Chrome`团队与其合作开发了`@babel/preset-modules`，并且已经作为`bugfixes`参数集成到`@babel/preset-env`中。

https://github.com/babel/preset-modules

如果你安装的 `@babel/preset-env` 版本在 7.9.0 以上，只要通过 `bugfixes: true` 就可以启用 `@babel/preset-modules` 的特性，而且还支持自定义 `target` ，不用单独再安装插件。这个特性将在 Babel 8 被默认启用。

根据官方的说法，启用这个特性之后，`@babel/preset-env` 会根据目标浏览器的支持程度，尝试将 broken syntax 编译为 closest *non-broken modern syntax* ，可以极大缩小编译后代码的体积（取决于 `target` 的配置和使用了多少新语法）。

[@Babel/preset-env - Babel 官方文档](https://babeljs.io/docs/en/babel-preset-env/#bugfixes)



### 9) 引入 TypeScript

项目引入 `ts` 的话有两种方式：

- 使用 `TypeScript Compiler (TSC)` 将 `ts` 编译为 `ES5` 以便能够在浏览器中运行，同时进行类型检查；
- 使用 `Babel` 来编译 `TS` ，使用 `TSC` 进行类型检查；

这里的话使用第二种方式，让 `Babel` 和 `TSC` 各司其职。

首先安装 `TypeScript` 以及 React 的 `type` ：

```bash
$ npm i typescript @types/react @types/react-dom -D
```

在项目根目录创建 `tsconfig.json` 配置如下：

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "ES2020",
    "lib": [
      "dom"
    ],
    // 编译 JS ，即让当前项目兼容 JS
    "allowJs": true,
    "jsx": "react-jsx",
    // 不输出编译内容，只进行类型检查
    "noEmit": true,
    "sourceMap": true,
    /* Strict Type-Checking Options */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    // 允许使用默认导入形式
    "allowSyntheticDefaultImports": true,
    // 启用 ES7 装饰器语法
    "experimentalDecorators": true,
    "skipLibCheck": true,
  },
  "include": [
    "src"
  ]
}
```

> 也可以使用 `npx tsc --init` 命令生成 `tsconfig.json` 配置文件

接下来进行 `babel` 的配置，安装 `@babel/preset-typescript` ，将我们代码从 `ts` 转为 `js` ：

```bash
$ npm i @babel/preset-typescript -D
```

`babel` 配置文件中加入：

```js
module.exports = {
  presets: [
    // 加载 @babel/preset-typescript 插件
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ],
    "@babel/preset-react"
  ],
  plugins: []
}
```

最后在 `webpack.config.js` 中 `babel` 匹配的路径中加入 `tsx` ：

```js
// 打包入口改为 tsx
entry: './src/index.tsx',
module: {
  rules: [
    {
      // 匹配 tsx 后缀
      test: /\.(js|ts)x?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    },
  ],
},
resolve: {
  // 引入模块的时候可以省略这些后缀
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.d.ts'],
}
```

这样的话，webpack 在遇到 TS 文件时，会调用 `babel-loader` 处理这个文件，由 Babel 将这个文件转换成标准 JavaScript 文件，然后将处理结果交还给 webpack ，webpack 继续后面的流程。

那么 Babel 是怎么将 TypeScript 文件转换成标准 JavaScript 文件的呢？答案是**直接删除掉类型注解**。先看一下 Babel 的工作流程，Babel 主要有三个处理步骤：解析、转换和生成。

1. 解析：将源代码处理为 AST ，对应 `@babel/parser` ；
2. 转换：对 AST 进行遍历，在此过程中对节点进行添加、更新、移除等操作，对应 `@babel/traverse` ；
3. 生成：把转换后的 AST 转换成字符串形式的代码，同时创建源码映射，对应 `@babel/generator` ；

那么在加入 `@babel/preset-typescript` 之后，Babel 会在第二步转换过程中，调用 `@babel/plugin-transform-typescript` 插件，遍历到类型注解节点，直接移除。

使用 Babel ，不仅能处理 TypeScript ，语法转换、polyfill 等功能也能一并享受。并且由于 Babel 只是移除类型注解节点，所以速度相当快。但是这边有一个问题，既然 Babel 把类型注解移除了，我们写 TypeScript 还有什么意义呢？我认为主要有以下几点考虑：

1. 性能方面，移除类型注解速度最快。收集类型并验证类型是否正确，是一个相当耗时的操作。
2. Babel 本身的限制。进行类型验证之前，需要解析项目中所有的文件，收集类型信息。而 Babel 只是一个**单文件处理工具**。Webpack 在调用 loader 处理文件时，也是一个文件一个文件调用的。所以 Babel 想验证类型也做不到。并且 Babel 的三个工作步骤中，并没有输出错误的功能。
3. 没有必要。类型验证错误提示可以交给编辑器。

当然，由于 Babel 的单文件特性，`@babel/preset-typescript` 对于需要收集完整类型系统信息才能正确运行的 TypeScript 语言特性，支持不是很好，如 const enums 等。

[TypeScript是如何工作的](https://juejin.cn/post/7007251289721536543)



接下来我们在 `src` 目录下创建 `App.tsx` ，内容如下：

```typescript
import * as React from 'react';

type Props = {
  toWhat: string;
};
type State = {

};

export default class App extends React.Component<Props, State>  {
  render() {
    return <div>Hello {this.props.toWhat}</div>;
  }
}
```

然后修改 `src/index.js` 为 `index.tsx` ，内容如下：

```typescript
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from "./App";

ReactDOM.render(
  <App toWhat="World by tsx" />,
  document.getElementById('app')
)
```

启动项目可以正常运行。



### 10) 开启 sourceMap

源码打包编译之后，代码的可读性下降，不利于代码调试，打断点不能定位到原始位置。为便于调试，webpack 提供了 sourceMap 功能，可以将编译后的代码映射回源代码。开启 `sourceMap` 很简单：

```js
devtool: "source-map"
```

开启 `sourceMap` 会拖慢打包速度，因此建议只在**开发环境**启用。此外，webpack 提供了多种类型可以使用，其中 `source-map` 最完整，可以精确定位到源码，但是速度最慢，生成的 `.map` 文件体积最大，其他还包括  `eval` 、`inline` 、`cheap` 等，在 Vue-cli 中的配置如下：

```js
devtool: "eval-cheap-module-source-map"
```

有关 `sourceMap` 的介绍可以参考：

[何为SourceMap？讲讲SourceMap食用姿势](https://juejin.cn/post/7008039749747212319)



### 11) 引入 CSS

Webpack 默认只编译 JS 文件，如果还需要编译 CSS 文件，就需要装一下 CSS 的 `loader` ：

```bash
$ npm i style-loader css-loader -D
```

- `css-loader` ： 用于处理 `css` 文件，将 `css` 编译为 JS 模块，使得能在 JS 文件中引入使用；
- `style-loader` ： 用于将 `css` 文件注入到 `index.html` 中的 `<style>` 标签上；

`webpack.config,js` 中添加配置如下：

```js
module: {
  rules: [
    {
      test: /\.css$/,
      // 这里可以看出 loader 解析的顺序是从后往前解析
      use: ["style-loader", "css-loader"]
    }
  ]
}
```

> 这边配置的 loader 主要是**处理第三方组件库的样式**，项目中编写业务组件通常不用 CSS ，而是使用 Sass、Less 等预编译器，对于预编译器的处理下面会讲



### 12) 引入 Sass

`Sass` 是 `css` 的预编译器，可以让我们写样式更顺手。

我们安装一下 `Sass` 以及它的 `loader` ：

```bash
$ npm install sass-loader sass -D
```

`webpack.config.js` 中添加如下配置：

```js
module: {
  rules: [
    {
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    },
    {
      test: /\.s[ac]ss$/i,
      use: [
        // 将 JS 字符串生成为 style 节点
        'style-loader',
        // 将 CSS 转化成 CommonJS 模块
        'css-loader',
        // 将 Sass 编译成 CSS
        'sass-loader',
      ],
    },
  ],
},
```

在 `App.tsx` 加几个类名，引入 `App.scss` ：

```typescript
import * as React from 'react';
import './App.scss';

type Props = {
  toWhat: string;
};
type State = {};

class App extends React.Component<Props, State> {
  render(): JSX.Element {
    return (
      <div className="app">
        <div className="text">Hello</div>
        <div>{this.props.toWhat}</div>
      </div>
    );
  }
}

export default App;
```

```scss
.app {
  .text {
    color: #f00;
  }
}
```

> 注意 Sass 的文件名只能是 `.scss`

再次运行可以看到文字带上颜色了。



### 13) 样式开启 sourceMap

通过上面的配置，我们看到样式只是定位到了 HTML 文件的 `style` 标签里面：

![Screen Shot 2021-08-25 at 9.57.44 PM](README.assets/Screen Shot 2021-08-25 at 9.57.44 PM.png)

为了方便打包之后我们在项目中调试样式，定位到样式在源文件的位置，可以添加 `SourceMap` ：

```js
rules: [
  {
    test: /\.s[ac]ss$/i,
    use: [
      'style-loader',
      {
        loader: "css-loader",
        options: {
          sourceMap: true
        }
      },
      {
        loader: "sass-loader",
        options: {
          sourceMap: true
        }
      },
    ],
  }
]
```

> 在 `css-loader` 和 `sass-loader` 都可以通过设置 `options` 选项启用 `sourceMap`

再重新打包，看下 `index.html` 的样式，样式已经定位到源文件上了：

![Screen Shot 2021-08-25 at 10.04.03 PM](README.assets/Screen Shot 2021-08-25 at 10.04.03 PM.png)



### 14) 使用 postcss autoprefixer 添加 CSS 前缀

这里我们用到 `PostCSS` 这个 `loader`，它是一个 CSS **预处理工具**，可以为 CSS3 的属性**添加前缀**，样式格式校验（`stylelint`），提前使用 `CSS` 新特性，实现 `CSS` 模块化，防止 `CSS` 样式冲突。

> 更多参数介绍，可访问中文官网的介绍:
> [《postcss-loader》](https://link.juejin.cn/?target=https%3A%2F%2Fwww.webpackjs.com%2Floaders%2Fpostcss-loader%2F)

首先安装 `PostCSS`：

```bash
$ npm install postcss-loader autoprefixer -D
```

在 `webpack.config.js` 中配置：

```js
const autoPrefixer = require('autoprefixer');

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: [
                  autoPrefixer()
                ]
              }
              // 在 Webpack 4 的写法
              // plugins: loader => [
              //   require('autoprefixer')(),
              // ]
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          },
        ],
      }
    ]
  }
}
```

还需要在 `package.json` 中添加判断浏览器版本：

```json
// package.json

{
  //...
  "browserslist": [
    "> 1%", // 全球浏览器使用率大于1%，最新两个版本并且是IE8以上的浏览器，加前缀 
    "last 2 versions",
    "not ie <= 8"
  ]
}
```

在 `App.scss` 中添加如下内容测试：

```scss
.app {
  .text {
    color: #f00;
    display: flex;
  }
}
```

可以看到前缀已经被添加上去了：

![Screen Shot 2021-08-25 at 10.19.24 PM](README.assets/Screen Shot 2021-08-25 at 10.19.24 PM.png)



### 15) Webpack 处理图片和字体

在 Webpack 4 里面通常会用到 `url-loader` 和 `file-loader` ，对于体积较小的图片，可以使用 `url-loader` 转为 Base64 ，然后通过 DataURL 引入（在雅虎军规中被称为 Inline Image），避免额外的网络请求。但是转成 Base64 存在一个问题，文件的体积会比原来大三分之一，对于体积较大的图片就不合适了，这个时候就可以使用 `file-loader` ，直接将图片拷贝到 dist 目录下，然后修改打包后文件引用路径，使之指向正确的文件。实际上，`url-loader` 已经封装了 `file-loader` ，通过配置 `limit` 参数，小于 `limit` 字节的文件会被转为 DataURL ，大于 `limit` 的会使用 `file-loader` 进行 copy 。

```js
module: {
  rules: [
    {
      test: /\.(png|svg|jpg|jpeg|gif)$/,
      include: [path.resolve(__dirname, 'src/')],
      use: [
        {
          loader: 'url-loader', // 根据图片大小，把图片转换成 base64
          options: {
            limit: 10000
          }, 
        }
      ]
  	}
  ]
}
```

对于字体文件直接使用 `file-loader` ：

```js
module: {
  rules: [
    {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      include: [path.resolve(__dirname, 'src/')],
      use: [ 'file-loader' ]
  	}
  ]
}
```

在 Webpack 5 里面新增 Asset Modules ，不用再装额外的 loader ：

```js
entry: './src/index.tsx',
output: {
  path: path.resolve(__dirname, '../dist'),
  // JS 文件放到 js/ 目录下
  filename: 'js/[contenthash].[name].js',
  // 指定 Asset Modules 的文件名
  // 把图片、字体放到 static/ 目录下
  assetModuleFilename: 'static/[hash][ext][query]',
},
module: {
	rules: [
		{
			test: /\.(woff|woff2|ttf|eot|svg)$/,
		    exclude: /node_modules/,
		    // Webpack 5 新增 Asset Modules ，不再使用 url-loader 和 file-loader
		    type: 'asset/resource',
		    // 也可以单独制定文件名
		    // generator: {
          	//	  filename: 'static/[hash][ext][query]'
        	// }
		},
		{
		    test: /\.(png|jpg|gif|jpeg|ico|cur)$/,
		    exclude: /node_modules/,
		    type: 'asset/resource'
		},
	]
},
```

我们在 `src/assets` 目录下放一张图片，然后到 `App.tsx` 里面引入测试一下：

```typescript
import Logo from "@assets/01.png";

function App() {
	return (
		<img src={Logo} alt="" />
	)
}
```

结果发现 TS 报了一个错误，提示模块没有声明：

![Screen Shot 2021-08-27 at 7.52.32 PM](README.assets/Screen Shot 2021-08-27 at 7.52.32 PM.png)

我们在 `src/d.ts` 目录下建一个 `global.d.ts` 文件，内容如下：

```typescript
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'
```

再回来看就不报错了。



### 16) 模块路径别名

刚才我们引入图片使用了相对路径，但是滥用相对路径会导致维护上的问题，例如下面这个路径，我们很难定位到这个模块是从哪里引入的：

> import xxx from "../../../../xxx"

而且像上面这样做了之后，等于增加了模块的耦合度，以后如果要将这个模块调整到别的目录，所有 `import` 的路径都要修改，非常麻烦。

但是使用绝对路径也不方便，每次都需要从根路径开始写。Webpack 提供了路径别名机制，我们可以在 `resolve` 里面配置一个 `alias` ：

```js
resolve: {
	alias: {
		"@": path.resolve(__dirname, "./src"),
		"@assets": path.resolve(__dirname, "./src/assets"),
    "@components": path.resolve(__dirname, "./src/components"),
    "@views": path.resolve(__dirname, "./src/views"),
    "@utils": path.resolve(__dirname, "./src/views"),
	}
}
```



### TODO: Webpack 添加编译进度条

到这边大部分 Webpack 的配置都已经配好了。如果在项目中引入了一个重量级的库，例如 `lodash` 、`moment` ，会发现打包比较慢而且没有进度信息。我们可以添加一个编译进度条：

```bash
$ npm i progress-bar-webpack-plugin chalk -D
```

然后在 `webpack.config.js` 中添加如下配置：

```js
const ProgressBarPlugin =  require("progress-bar-webpack-plugin");
const chalk = require("chalk");

module.exports = {
	plugins: [
		new ProgressBarPlugin({
	      format: `:msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`
	    })
	]
}
```



### 18) 配置 ESLint

可以配置 `eslint` 来进行语法上静态的检查，也可以对 `ts` 进行检查：

```bash
$ npm i eslint -D
```

运行下面的命令，初始化一个 `.eslintrc.js` 文件：

```bash
$ npx eslint --init
```

根据提示回答几个问题就行：

![Screen Shot 2021-08-26 at 9.21.42 PM](README.assets/Screen Shot 2021-08-26 at 9.21.42 PM.png)

> 注意第一个问题选择 check syntax and find problems 就行，代码风格检查交给 Prettier，下面会讲

配置文件生成之后，如果你的 VS Code 装了 ESLint 插件，打开 `.eslintrc.js` 发现 `module.exports` 报错了：

<img src="README.assets/Screen Shot 2021-08-26 at 9.27.56 PM.png" alt="Screen Shot 2021-08-26 at 9.27.56 PM" style="zoom:50%;" />

然后 `webpack.config.js` 里面所有 Node.js 的用法也都报错了：

<img src="README.assets/Screen Shot 2021-08-26 at 9.29.11 PM.png" alt="Screen Shot 2021-08-26 at 9.29.11 PM" style="zoom:50%;" />

这是因为我们在 `.eslintrc.js` 中配置 `"browser": true` ，所以 Node.js 的写法都标红了。

解决方法很简单，大家一定也都看到过，就是在根目录下建一个 `.eslintignore` 文件：

```
node_modules
build
public
dist
**/*.js
```

添加之后报错就消失了，只对 `src` 目录下的业务代码进行检查。

然后我们在 `package.json` 中可以添加一个 `lint` 命令来修复代码：

```json
"scripts": {
  "dev": "webpack-dev-server --mode development --open",
  "build": "webpack --mode production",
  "lint": "eslint src --fix"
}
```

配合 VS Code 可以做到边写代码边自动检测 `eslint` ，以及保存的时候自动修复 `eslint` 相关错误。

可以安装 ESLint 插件，然后在 VS Code 的 `settings.json` 中添加如下配置：

```json
{
  "eslint.validate": ["javascript", "javascriptreact", "vue", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
}
```

为了使用更完善的 `eslint` 配置，我们也可以直接引用腾讯 `Alloy` 团队的推荐配置：

> https://github.com/AlloyTeam/eslint-config-alloy



### 19) 配置 Prettier

`prettier` 主要做代码风格上的检查，例如字符串双引号还是单引号、缩进、换行问题、是否加尾分号，类似这样的

> 对于 Vue 项目，直接使用 Vetur 就行，自带了格式化，规范就是使用 Prettier

当然 `eslint` 也可以配置这些，但为了分离它们各自的职责，最好还是用 `prettier` 来格式化代码风格。

`prettier` 也和 `eslint` 一样提供了 npm 包和 VS Code 插件两种形式，这边直接装 VS Code 插件，在写代码的时候自动检查格式问题。

然后在根目录新建 `.prettierrc.js` 文件，这里直接引用 [腾讯 Alloy](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FAlloyTeam%2Feslint-config-alloy) 团队推荐的配置：

```js
module.exports = {
  // max 120 characters per line
  printWidth: 120,
  // use 2 spaces for indentation
  tabWidth: 2,
  // use spaces instead of indentations
  useTabs: false,
  // semicolon at the end of the line
  semi: true,
  // use single quotes
  singleQuote: true,
  // object's key is quoted only when necessary
  quoteProps: 'as-needed',
  // use double quotes instead of single quotes in jsx
  jsxSingleQuote: false,
  // no comma at the end
  trailingComma: 'all',
  // spaces are required at the beginning and end of the braces
  bracketSpacing: true,
  // end tag of jsx need to wrap
  jsxBracketSameLine: false,
  // brackets are required for arrow function parameter, even when there is only one parameter
  arrowParens: 'always',
  // format the entire contents of the file
  rangeStart: 0,
  rangeEnd: Infinity,
  // no need to write the beginning @prettier of the file
  requirePragma: false,
  // No need to automatically insert @prettier at the beginning of the file
  insertPragma: false,
  // use default break criteria
  proseWrap: 'preserve',
  // decide whether to break the html according to the display style
  htmlWhitespaceSensitivity: 'css',
  // vue files script and style tags indentation
  vueIndentScriptAndStyle: false,
  // lf for newline
  endOfLine: 'lf',
  // formats quoted code embedded
  embeddedLanguageFormatting: 'auto',
};
```

`prettier` 同样也要在根目录下建一个 `.prettierignore` 文件：

```
node_modules
dist
build
.prettierignore
.gitignore
.eslintignore
```

同样的，为了保存的时候自动帮我们格式化，可以修改 VS Code 的 `settings.json` ：

```json
{
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "javascriptreact", "vue", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

> 建议把上面配置写到项目根目录的 `.vscode/settings.json` 文件里面，这样配置可以跟项目关联

到这边开发环境基本已经搭建完成，下面介绍业务相关的一些配置。



## 二、业务相关配置



### 1) 引入 antd

运行下面的命令安装 Ant Design 组件库：

```bash
$ npm i antd
```

使用组件库通常都会按需引入，以便减小打包后的体积：

```js
import Button from 'antd/lib/button';  
import 'antd/lib/button/style';
```

但是这样写很麻烦，因此使用按需引入插件，在打包编译期间将 `import` 改为上面的形式：

```bash
$ npm i babel-plugin-import -D
```

在 `babel.config.js` 中配置如下：

```js
module.exports = {
  "presets": [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ],
    "@babel/preset-react"
  ],
  "plugins": [
    [
      "import",
      {
        "libraryName": "antd",
        // true 代表使用 Less
        // 'css' 代表使用 CSS
        "style": "css"
      }
    ]
  ]
}
```

修改 `App.tsx` 如下：

```typescript
import { Button } from "antd";
import * as React from 'react';
import './App.scss';

type Props = {
  toWhat: string;
}
type State = {}

class App extends React.Component<Props, State>  {
  render(): JSX.Element {
    return (
      <div className="app">
        <div className="text">Hello</div>
        <div>{this.props.toWhat}</div>
        <div>
          <Button type="primary">测试按钮</Button>
        </div>
      </div>
    );
  }
}

export default App;
```

重新编译之后正常运行，不过 TS 报了一个错误：

![Screen Shot 2021-08-25 at 10.51.11 PM](README.assets/Screen Shot 2021-08-25 at 10.51.11 PM.png)

按照提示在 `tsconfig.json` 中添加配置：

```bash
{
	"compilerOptions": {
		"moduleResolution": "node"
	}
}
```



### 2) 生产环境下将 antd 样式抽取成单独文件

前面我们使用了 `style-loader` 将样式都打包进 `bundle.js` ，然后注入到了 `style` 标签里面。由于第三方组件库通常样式文件很大（即使用了按需引入），如果都打包进 `bundle.js` 显然不是合理的做法，所以我们需要将组件库的样式打包成单独的 CSS 文件。

Webpack4 开始使用 `mini-css-extract-plugin` 插件，而在 1-3 版本使用 `extract-text-webpack-plugin`。

> 建议只在生产环境使用 `mini-css-extract-plugin` 抽取样式，开发环境开启 HMR 之后，为了让样式源文件也能热更新，需要让样式随 JS Bundle 一起输出，然后用 `style-loader` 注入到 `<style>` 标签内

安装插件：

```bash
$ npm install mini-css-extract-plugin -D
```

引入插件：

```js
// webpack.config.js

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
```

然后修改 `rules`，将 `style-loader`，替换成 `MiniCssExtractPlugin.loader` ，然后添加 `plugins` 配置项：

```js
module: {
  rules: [
    {
      test: /\.css$/i,
      use: [
        // 'style-loader',
        MiniCssExtractPlugin.loader,
        'css-loader'
      ],
    },
  ]
},
plugins: [
  new MiniCssExtractPlugin({
    filename: '[name].css', // 最终输出的文件名
    chunkFilename: '[id].css'
  })
]
```

> 注意：抽取样式以后，就不能使用 `style-loader` 

再次编译后可以看到 `antd` 样式是通过单独的 CSS 文件引入的，而 `style` 标签里面只有业务组件的样式：

![Screen Shot 2021-08-25 at 11.13.30 PM](README.assets/Screen Shot 2021-08-25 at 11.13.30 PM.png)

> 这里有个问题，Vue 项目打包之后，组件库的样式都是在业务组件后面进来的，所以导致业务组件里面没办法覆盖组件库默认样式，需要通过 `::v-deep` 样式穿透



### 3) 第三方库和业务代码打包进不同的 chunks

将 `node_modules` 里面的开发依赖和业务代码分别打包进不同的 chunks ，可以使用 `SplitChunksPlugin` 。

在 Webpack 4 之前版本用的是 `CommonChunksPlugin` ，在 Webpack 4 中改成了 `optimization.splitChunks` 。

在 `webpack.config.js` 中添加如下配置：

```js
module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[contenthash].[name].js'
  },
  optimization: {
    splitChunks: {
      minSize: 3000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          // "initial" 针对入口文件做代码分割
          // "all" 把 node_modules 开发依赖都打包进 vendors
          // "async"(默认就是异步，针对异步加载的模块做代分割)
          chunks: 'all',
          // priority: 10,
        },
      }
    }
  }
}
```

再次编译之后可以看到被拆分出两个 chunks ，其中 vendors 是开发依赖，而 main 是业务代码：

![Screen Shot 2021-08-26 at 9.11.43 PM](README.assets/Screen Shot 2021-08-26 at 9.11.43 PM.png)

推荐阅读：

[有点难的知识点：Webpack Chunk 分包规则详解](https://juejin.cn/post/6961724298243342344)

[「Webpack」从0到1学会 code splitting](https://juejin.cn/post/6979769284612325406)

[剖析 Webpack SplitChunksPlugin 源码: 学完你也能写一个](https://juejin.cn/post/6982157120594509837)



### 4) webpack 配置合并和提取公共配置

在开发环境（development）和生产环境（production）配置文件有很多不同，但也有部分相同，为了不每次更换环境的时候都修改配置，我们就需要将配置文件做合并，和提取公共配置。

开发环境和生产环境的区别如下：

**开发环境**

- **NODE_ENV 为 development**
- 启用模块热更新（hot module replacement）
- 额外的 `webpack-dev-server` 配置项，API Proxy 配置项
- 输出 Sourcemap

**生产环境**

- **NODE_ENV 为 production**
- 将 React、jQuery 等常用库设置为 `external`，直接采用 CDN 线上的版本
- 样式源文件（如 css、less、scss 等）需要通过 `MiniCssExtractPlugin` 独立抽取成 css 文件
- 启用 post-css
- 启用 optimize-minimize（如 uglify 等）
- 中大型的商业网站生产环境下，是绝对不能有 `console.log()` 的

> 代码移除 `console.log()` 可以在很多环节进行，例如在 Babel 编译阶段使用 `babel-plugin-transform-remove-console` ，或者设置 `uglifyJs` 的 `drop_console: true` ，在代码压缩阶段移除。我们知道 `console.log()` 是有副作用的，在 Babel 编译阶段移除有利于提升 webpack  Tree-Shaking 的效果，而 `uglifyJs` 是对打包之后的 `chunk` 进行处理，但是 `uglifyJs` 在 `webpack.config.js` 中配置比较灵活，可以区分开发环境和生产环境。

> 开发环境下启用了 HMR ，为了让样式源文件的修改同样也能被热替换，不能使用 `MiniCssExtractPlugin` ，而转为随 JS Bundle 一起输出。

我们使用 `webpack-merge` 工具，将两份配置文件合并：

```bash
$ npm i webpack-merge -D
```

然后我们在根目录建一个 `build` 文件夹，里面创建三个文件：

```bash
webpack.base.config.js
webpack.dev.config.js
webpack.prod.config.js
```

`webpack.base.config.js` 内容如下：

```js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoPrefixer = require("autoprefixer");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // 由于配置文件不在根目录，注意路径引用问题
  entry: path.resolve(__dirname, '../src/index.tsx'),
  output: {
    // 由于配置文件不在根目录，注意路径引用问题
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[contenthash].[name].js',
    assetModuleFilename: 'static/[hash][ext]',
  },
  module: {
    rules: [
      // 这里不详细展开了
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.d.ts'],
    // 由于配置文件不在根目录，注意路径引用问题
    alias: {
      "@": path.resolve(__dirname, "../src"),
      "@assets": path.resolve(__dirname, "../src/assets"),
      "@components": path.resolve(__dirname, "../src/components"),
    }
  },
  plugins: [
    new ProgressBarPlugin({
      format: `:msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`
    }),
    new HtmlWebpackPlugin({
      // 由于配置文件不在根目录，注意路径引用问题
      template: path.join(__dirname, '../public/index.html'),
      title: "react-zero-to-one",
      filename: "index.html",
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: '[id].css'
    }),
    new CleanWebpackPlugin()
  ],
  optimization: {
    splitChunks: {
      minSize: 3000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          // priority: 10,
        },
      }
    }
  }
}
```

> 由于配置文件不在根目录，需要注意引用路径的问题

`webpack.dev.confg.js` 内容如下：

```js
const path = require('path');
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");

module.exports = merge(baseConfig, {
  mode: "development",
  // 开发环境下开启 sourceMap
  devtool: "source-map",
  // 只有在开发环境才启用 devServer
  devServer: {
    // 由于配置文件不在根目录，注意路径引用问题
    static: path.resolve(__dirname, '../dist'),
    compress: true,
    hot: true,
    open: true,
    host: 'localhost',
    port: '8066'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ]
})
```

`webpack.prod.config.js` 内容如下：

```js
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");

module.exports = merge(baseConfig, {
  mode: "production",
  stats: "errors-only"
})
```

这样改了之后，由于配置文件不在根目录，需要在 `package.json` 中手动指定：

```json
"scripts": {
  "dev": "webpack-dev-server --config build/webpack.dev.config.js",
  "build": "webpack --config build/webpack.prod.config.js",
  "lint": "eslint src --fix"
},
```



### 5) 生产环境下压缩 JS 和 CSS

生产环境下为了获得最佳的 chunk size ，会对源码进行压缩处理。

**压缩 JS**

压缩 JS 的常用方法如下：

1. 使用 `terser` 或者 `uglify` 压缩混淆化 JS ；
2. 使用 `gzip` 或者 `brotil` 压缩，在网关处开启；
3. 使用 `webpack-bundle-analyzer` 分析打包体积，替换占用较大体积的库，例如 `moment` 改为 `dayjs` ，使用支持 Tree-Shaking 的库；
4. 对于无法 Tree-Shaking 的库，进行按需引入模块，例如使用 `babel-plugin-import` 按需引入 antd 组件库；
5. 使用 webpack 的 `splitChunksPlugin` ，把运行时、被引用多次的库打包在一起，避免某一个库被多次引用，多次打包；

Webpack 内置了代码压缩功能，设置 `mode: "production"` 即可启用，但是自带的功能比较简单，通常不能满足项目需求，这个时候就要安装 `plugin` 来实现。

在 webpack 4.x 版本使用 `uglifyjs-webpack-plugin` 或者 `parallel-uglify-plugin` 多进程压缩 JS ，但是 webpack 5 的文档已经找不到这两个 plugin 了，取而代之的是 `terser-webpack-plugin` ，默认开启了多进程和缓存。

> `uglifyjs-webpack-plugin` 的事件钩子 `optimizeChunkAssets` 已经废弃了，在 `terser-webpack-plugin` 中改为了 `processAssets`

webpack v5 开箱即带有最新版本的 `terser-webpack-plugin`。如果你使用的是 webpack v5 或更高版本，同时希望自定义配置，那么仍需要安装 `terser-webpack-plugin` ：

```bash
$ npm i terser-webpack-plugin -D
```

基本使用如下：

```js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
```

其中 `TerserPlugin` 可以传递如下配置：

```typescript
{
  // 默认值 /\.m?js(\?.*)?$/i
  test: String | RegExp | Array<String|RegExp>,
  // 默认值 undefined
  include: String | RegExp | Array<String|RegExp>,
  // 默认值 undefined
  exclude: String | RegExp | Array<String|RegExp>, 
  // 默认值 true ，默认并发数 os.cpus().length - 1
  parallel: Boolean | Number,
  // 默认值 TerserPlugin.terserMinify ，可以指定其他压缩函数
  minify: Function,
  // 压缩函数的配置项
  terserOptions: Object,
  // 默认值 true
  extractComments: Boolean | String | RegExp | Function<(node, comment) -> Boolean|Object> | Object
}
```

在上面的配置中，`test` 、`include` 、`exclude` 、`parallel` 基本上不用设置，直接用默认值即可，`minify` 可以自定义压缩函数，`TerserPlugin` 默认使用 `terser` 进行压缩，还可以使用 `swc` 、`uglifyJS` 、`esbuild` 来压缩。

`terserOptions` 是压缩函数的配置项，当选用 `terser` 时，`terserOptions` 对应的就是 `terser` 的配置项。`terser` 的配置与 `uglifyJs` 基本一致：

```js
{
    parse: {
        // parse options
    },
    compress: {
        // compress options
    },
    mangle: {
        // mangle options

        properties: {
            // mangle property options
        }
    },
    format: {
        // format options (can also use `output` for backwards compatibility)
    },
    sourceMap: {
        // source map options
    },
    ecma: 5, // specify one of: 5, 2015, 2016, etc.
    enclose: false, // or specify true, or "args:values"
    keep_classnames: false,
    keep_fnames: false,
    ie8: false,
    module: false,
    nameCache: null, // or specify a name cache object
    safari10: false,
    toplevel: false
}
```

> https://github.com/terser/terser

在 `webpack.prod.config.js` 中配置如下：

```js
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(baseConfig, {
  mode: "production",
  stats: "errors-only",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        }
      }),
    ]
  }
})
```

> 这边配置了在生产环境下移除 `console.*` 和 `debugger` ，其他配置项使用默认值即可，如要修改建议仔细阅读文档，否则可能引入 bug

这边顺便提一下，本人之前维护过一个老项目，开发环境和生产环境用的都是一个配置，代码压缩使用 `uglifyJs` ，没有额外配置，但是 `uglifyJs` 的 `drop_debugger` 默认是 `true` 的，因此即使在代码中使用 `debugger` ，打包之后也会被去掉，所以打断点只能在浏览器开发者工具的 Source 面板操作，很不方便。



**压缩 CSS**

在 webpack 4 及之前的版本使用 `optimize-css-assets-webpack-plugin` ，在 webpack 5 中可以使用 `css-minimizer-webpack-plugin` ：

```bash
$ npm i css-minimizer-webpack-plugin -D
```

在 `webpack.prod.config.js` 中配置如下：

```js
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(baseConfig, {
  mode: "production",
  stats: "errors-only",
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ]
  }
})
```

> `CssMinimizerPlugin` 默认只在生产环境开启 CSS 优化，如果在开发环境使用需要进行配置



### 6) 配置环境变量

Webpack 有一个 `mode` 选项，当我们设为 `development` ，会将 `DefinePlugin` 中 `process.env.NODE_ENV` 的值设为 `development` ，如果设为 `production` ，则会将 `DefinePlugin` 中 `process.env.NODE_ENV` 的值设为 `production` 。这样在项目中就可以使用 `process.env.NODE_ENV` 获取到环境变量。

> 前端项目的环境变量和 Node.js 的环境变量实际上是不一样的，我们在项目中使用的 `process.env.NODE_ENV` 会在打包编译时直接替换为对应的值，下面会详细说明

但通常我们不满足于使用 `process.env.NODE_ENV` ，一般会把所有跟环境相关的配置都设置为环境变量，例如后端环境地址，这样在不同模式下打包就可以启用对应的后端环境，非常方便。

通常我们会在项目根目录下创建几个文件，用于配置环境变量：

```js
.env.development
.env.production
```

在 Vue 的项目里面不用任何配置，直接添加上述文件就可以生效了。但是自己搭建的项目就有点头疼，好在找到一个第三方库 `dotenv` ：

> https://www.npmjs.com/package/dotenv

`dotenv` 的作用就是读取 `.env` 文件，把配置信息解析为一个对象，然后添加到 Node 的 `process.env` 里面。这个库可以同时用于前端和后端项目，前端环境变量主要用于配置后端环境地址，而后端环境变量通常用于配置数据库账号密码。

按照官方文档的说明，在 `webpack.dev.config.js` 里面添加了如下代码：

```js
// ...
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });
```

但是重新编译之后，在项目中获取自定义的环境变量，例如 `process.env.REACT_APP_BASE` ，还是会报错：

> Uncaught ReferenceError: process is not defined

查阅 Webpack 文档发现，webpack 的环境变量和操作系统中的 `bash` 和 `cmd` 环境变量是不一样的：

> https://webpack.docschina.org/guides/environment-variables/

Webpack 的环境变量可以理解为全局变量，使用 `DefinePlugin` 进行配置：

```js
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify("development"),
  'process.env.DEBUG': JSON.stringify(false),
});
```

然后我们可以在业务组件中编写如下代码：

```js
if (process.env.NODE_ENV === 'production') {
  console.log('Welcome to production');
}
if (process.env.DEBUG) {
  console.log('Debugging output');
}
```

Webpack 在打包编译的时候，会把我们在 `DefinePlugin` 中定义的变量替换为对应的值：

```js
if ('development' === 'production') {
  // <-- default value is taken
  console.log('Welcome to production');
}
if ('false') {
  // <-- 'false' from DEBUG is taken
  console.log('Debugging output');
}
```

假如 `REACT_APP_BASE` 没有在 `DefinePlugin` 中配置，那么打包编译之后不会进行替换，还是保留 `process.env.REACT_APP_BASE` ，因此就会报错了。

那么 Webpack 还提供了 `EnvironmentPlugin` ，用于简化 `DefinePlugin` 的配置：

```js
// 使用 EnvironmentPlugin 进行配置
new webpack.EnvironmentPlugin(['NODE_ENV', 'DEBUG']);

// 等价于下面的代码
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
});
```

> https://webpack.docschina.org/plugins/environment-plugin/

顺着这个思路，我们先用 `dotenv` 把环境变量加载到 Node 的 `process.env` 中，然后再给 `EnvironmentPlugin` 传递一个 `key` 组成的数组，由 `EnvironmentPlugin` 从 `process.env` 读取对应的值传给 `DefinePlugin` ，这样在业务组件中就可以使用环境变量了：

```js
// webpack.dev.config.js
const path = require('path');
const webpack = require("webpack");
// 将环境变量加载到 Node.js 的 process.env 中
const envParams = require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });

module.exports = {
  // ...
  plugins: [
    // 传递一个 key 组成的数组
    new webpack.EnvironmentPlugin(Object.keys(envParams.parsed))
  ]
}
```

其实可以把配置环境变量的代码放到 `webpack.base.config.js` 里面，但是经过试验发现在 Webpack 配置文件里面可能获取不到 `process.env.NODE_ENV` ：

```js
// webpack.base.config.js
const path = require('path');
const webpack = require("webpack");
// 这边有可能获取不到，导致下面路径拼接出现错误
console.log(process.env.NODE_ENV);
const envParams = require('dotenv').config({ path: path.resolve(__dirname, '../.env.' + process.env.NODE_ENV) });

module.exports = {
  plugins: [
    new webpack.EnvironmentPlugin(Object.keys(envParams.parsed))
  ]
}
```

因此建议在 `webpack.dev.config.js` 和 `webpack.prod.config.js` 中各放一份代码。

到这边环境变量已经配置完成，我们修改一下 npm scripts ：

```json
"scripts": {
  "dev": "webpack-dev-server --config build/webpack.dev.config.js",
  "build:dev": "webpack --config build/webpack.dev.config.js",
  "build:prod": "webpack --config build/webpack.prod.config.js",
  "lint": "eslint src --fix"
},
```

我们可以使用 `npm run build:dev` 打开发环境的包，使用 `npm run build:prod` 打生产环境的包。



### 7) 配置路由





### 8) 配置全局状态管理





### 9) 配置网络请求库





### 10) 提升打包速度

在 Webpack 打包的时候，通常会采用一些分包策略，例如 `SplitChunksPlugin` ，异步懒加载等。但是需要注意，这些分包策略对于提升打包速度并没有帮助，仅仅只是优化首屏时间。

对于一些不经常更新的第三方库，例如 `react` 、`lodash` 、`vue` ，即使用了 `SplitChunksPlugin` ，webpack 每次打包实际还是要去处理这些第三方库，只是打包之后，能把第三方库和我们自己的代码分开。

> 本人维护过一个老项目，有一些库，例如 `jQuery` ，没有使用 npm 下载，而是直接下载了源码放到项目里面，然后配置 webpack 多入口打包，然后挂载到 `window` 对象上，在 `webpack.DefinePlugin` 中定义全局变量，不得不说这样做太愚蠢了，这样不管用没用到都打包进去，根本没法 Tree Shaking ，还不如 npm 下载了

显然每次构建时，对不经常更新而体积很大的第三方库都重复打包就显得没有必要。对这些库的处理通常有两种方案：

- 一种是配置 `externals` 选项，让 webpack 不打包某部分，然后通过外链脚本引入，或者通过 CDN 引入；
- 另一种是通过 DllPlugin ，但是在新版本的 Webpack 中测试，提升的速度不是很明显，因此对于 Webpack 5 来说使用的意义不大；



### 11) Module Federation Speed Up

通常我们的代码可以简单区分为业务代码和第三方库，如果不作处理，每次构建时都需要把所有的代码都重新构建一次，但是大部分情况下，很多第三方库的代码并不会发生变化（除非是版本升级），因此我们可以把复用性较高的第三方模块进行单独打包并提交到 git 仓库，这样每次构建只需要打包业务代码。

在 Webpack 5 之前，通常会使用 DllPlugin 进行依赖预构建，在 Webpack 5 提供了一个新特性 Module Federation ，官网对 Module Federation 介绍是：

> 多个独立的构建可以形成一个应用程序。这些独立的构建不会相互依赖，因此可以单独开发和部署它们。这通常被称为微前端，但并不仅限于此。

简单来说，MF 实际上就是可以把多个无单独依赖的、单独部署的应用合为一个。或者说不止是应用，MF 支持的粒度更细。它可以把多个模块、多个 npm 包合为一个。



## 参考

[2021年从零开发前端项目指南](https://juejin.cn/post/6999807899149008910)

[手把手带你入门 Webpack4](https://juejin.cn/post/6844903912588181511)

[【开源】一个 React + TS 项目模板](https://juejin.cn/post/6844904102355271694)

[Webpack 打包太慢? 试试 Dllplugin](https://juejin.cn/post/6844903951410659341)

[学习 Webpack5 之路（优化篇）- 近 7k 字](https://juejin.cn/post/6996816316875161637)

