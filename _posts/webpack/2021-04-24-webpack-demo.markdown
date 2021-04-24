---
layout: post
title: 深入理解 webpack
tags: [webpack]
---

# 入门

我们编写一下以下的案例：

```html
<script src="src/index.js" type="module"></script>
```

```javascript
// src/index.js

import addHeader from './add-header.js';
const header = addHeader();
document.body.appendChild(header);
```

```javascript
// src/add-header.js
export default function addHeader() {
  const header = document.createElement('div');
  header.innerHTML = 'header';
  header.addEventListener('click', () => console.log('header'));
  return header;
}
```

采用 es module 的方式来编写。现在越来越多的浏览器也支持 es module，而新出的 vite 也是觉得现在大环境下 es module 的主流浏览器已经都支持了，可以大规模使用了

但是还不支持的话，我们上面这段代码是会报错的，我们开始引入 webpack 的学习

```bash
yarn add webpack webpack-cli -D
```

引入核心模块 webpack 和 命令行模块 webpack-cli

package.json 引入下面的命令

```json
"scripts": {
  "dev": "webpack"
},
```

什么都不做的情况下直接运行 `yarn dev` 能得到下面的结果

```bash
yarn dev
yarn run v1.22.4
$ webpack
asset main.js 198 bytes [emitted] [minimized] (name: main)
orphan modules 201 bytes [orphan] 1 module
./src/index.js + 1 modules 305 bytes [built] [code generated]

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

webpack 5.35.0 compiled with 1 warning in 247 ms
```

虽然有一些报错，但是最终得到了我们想要的文件 `dist/main.js`

修改下 index.html 文件

```html
<script src="dist/main.js"></script>
```

发现也是正常运行的，看下我们 main.js 的内容

```javascript
(() => {
  'use strict';
  const e = (function () {
    const e = document.createElement('div');
    return (
      (e.innerHTML = 'header'),
      e.addEventListener('click', () => console.log('header')),
      e
    );
  })();
  document.body.appendChild(e);
})();
```

不过显然使用的只是 webpack 默认的配置，项目中肯定需要很多定制化的配置，wepback 提供了 webpack.config.js 的默认配置文件，我们可以新建这么一个文件，去编写一些个性化配置

它返回的是一个模块化的配置对象，先配置一个简单的

```javascript
const path = require('path');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
  },
};
```

我们重新打包，这个时候输出的文件名是 bundle.js 了，所以 html 文件也做对应的改变就好了

我们接下来也把 mode 给加上

```javascript
const path = require('path');
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
  },
};
```

得到下面的打包结果和打包文件

```bash
npx webpack
asset bundle.js 4.33 KiB [emitted] (name: main)
runtime modules 670 bytes 3 modules
cacheable modules 305 bytes
  ./src/index.js 104 bytes [built] [code generated]
  ./src/add-header.js 201 bytes [built] [code generated]
webpack 5.35.0 compiled successfully in 111 ms
```

```javascript
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => {
  // webpackBootstrap
  /******/ 'use strict';
  /******/ var __webpack_modules__ = {
    /***/ './src/add-header.js':
      /*!***************************!*\
  !*** ./src/add-header.js ***!
  \***************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        eval(
          "__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ addHeader)\n/* harmony export */ });\nfunction addHeader() {\n  const header = document.createElement('div');\n  header.innerHTML = 'header';\n  header.addEventListener('click', () => console.log('header'));\n  return header;\n}\n\n\n//# sourceURL=webpack://demo-1/./src/add-header.js?"
        );

        /***/
      },

    /***/ './src/index.js':
      /*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        eval(
          '__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _add_header_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./add-header.js */ "./src/add-header.js");\n\nconst header = (0,_add_header_js__WEBPACK_IMPORTED_MODULE_0__.default)();\ndocument.body.appendChild(header);\n\n\n//# sourceURL=webpack://demo-1/./src/index.js?'
        );

        /***/
      },

    /******/
  }; // The module cache
  /************************************************************************/
  /******/ /******/ var __webpack_module_cache__ = {}; // The require function
  /******/
  /******/ /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    } // Create a new module (and put it into the cache)
    /******/ /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    }); // Execute the module function
    /******/
    /******/ /******/ __webpack_modules__[moduleId](
      module,
      module.exports,
      __webpack_require__
    ); // Return the exports of the module
    /******/
    /******/ /******/ return module.exports;
    /******/
  } /* webpack/runtime/define property getters */
  /******/
  /************************************************************************/
  /******/ /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })(); /* webpack/runtime/hasOwnProperty shorthand */
  /******/
  /******/ /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })(); /* webpack/runtime/make namespace object */
  /******/
  /******/ /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module',
        });
        /******/
      }
      /******/ Object.defineProperty(exports, '__esModule', { value: true });
      /******/
    };
    /******/
  })(); // startup // Load entry module and return exports // This entry module can't be inlined because the eval devtool is used.
  /******/
  /************************************************************************/
  /******/
  /******/ /******/ /******/ /******/ var __webpack_exports__ = __webpack_require__(
    './src/index.js'
  );
  /******/
  /******/
})();
```

我们尝试下把注释全部去掉，看看运行

```javascript
(() => {
  ('use strict');
  var __webpack_modules__ = [
    ,
    (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        default: () => addHeader,
      });
      function addHeader() {
        const header = document.createElement('div');
        header.innerHTML = 'header';
        header.addEventListener('click', () => console.log('header'));
        return header;
      }
    },
  ];

  var __webpack_module_cache__ = {};

  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (__webpack_module_cache__[moduleId] = {
      exports: {},
    });

    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    return module.exports;
  }

  (() => {
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
        }
      }
    };
  })();

  (() => {
    __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
  })();

  (() => {
    __webpack_require__.r = (exports) => {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module',
        });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  })();

  var __webpack_exports__ = {};
  (() => {
    __webpack_require__.r(__webpack_exports__);
    var _add_header_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);

    const header = (0, _add_header_js__WEBPACK_IMPORTED_MODULE_0__.default)();
    document.body.appendChild(header);
  })();
})();
```

根据浏览器的断点运行看看执行结果，对 webpack 的机制就大概懂了

尝试多引入一个模块，发现大体框架都不变的

```javascript
/******/ (() => {
  // webpackBootstrap
  /******/ 'use strict';
  /******/ var __webpack_modules__ = [
    ,
    /* 0 */ /* 1 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ addHeader,
        /* harmony export */
      });
      function addHeader() {
        const header = document.createElement('div');
        header.innerHTML = 'header';
        header.addEventListener('click', () => console.log('header'));
        return header;
      }

      /***/
    },
    /* 2 */
    /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */ default: () => /* binding */ add,
        /* harmony export */
      });
      function add(a, b) {
        return a + b;
      }

      /***/
    },
    /******/
  ]; // The module cache
  /************************************************************************/
  /******/ /******/ var __webpack_module_cache__ = {}; // The require function
  /******/
  /******/ /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    } // Create a new module (and put it into the cache)
    /******/ /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    }); // Execute the module function
    /******/
    /******/ /******/ __webpack_modules__[moduleId](
      module,
      module.exports,
      __webpack_require__
    ); // Return the exports of the module
    /******/
    /******/ /******/ return module.exports;
    /******/
  } /* webpack/runtime/define property getters */
  /******/
  /************************************************************************/
  /******/ /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })(); /* webpack/runtime/hasOwnProperty shorthand */
  /******/
  /******/ /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })(); /* webpack/runtime/make namespace object */
  /******/
  /******/ /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module',
        });
        /******/
      }
      /******/ Object.defineProperty(exports, '__esModule', { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  (() => {
    __webpack_require__.r(__webpack_exports__);
    /* harmony import */ var _add_header_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      1
    );
    /* harmony import */ var _add_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      2
    );

    console.log((0, _add_js__WEBPACK_IMPORTED_MODULE_1__.default)(1, 2));
    const header = (0, _add_header_js__WEBPACK_IMPORTED_MODULE_0__.default)();
    document.body.appendChild(header);
  })();

  /******/
})();
```

# loader

也是才发现，入口文件不一定是 js 文件，也可以是 css 文件

```javascript
module.exports = {
  mode: 'development',
  entry: './src/index.css',
};
```

```css
body {
  width: 100%;
}
```

但是会报错的

```bash
yarn dev
yarn run v1.22.4
$ webpack
asset main.js 1.46 KiB [emitted] (name: main)
./src/index.css 23 bytes [built] [code generated] [1 error]

ERROR in ./src/index.css 1:5
Module parse failed: Unexpected token (1:5)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
> body {
|   width: 100%;
| }

webpack 5.35.1 compiled with 1 error in 80 ms
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

这里我们开始去使用 loader，它的处理流程是

css -> css-loader -> webpack - bundle.js

我们先安装依赖

```bash
yarn add css-loader -D
```

修改配置文件，mode 使用 none 的原因是方便看打包后的文件代码

```javascript
module.exports = {
  mode: 'none',
  entry: './src/index.css',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: 'css-loader',
      },
    ],
  },
};
```

成功完成打包

```bash
yarn dev
yarn run v1.22.4
$ webpack
asset main.js 5.53 KiB [emitted] (name: main)
runtime modules 937 bytes 4 modules
cacheable modules 1.88 KiB
  ./src/index.css 323 bytes [built] [code generated]
  ./node_modules/css-loader/dist/runtime/api.js 1.57 KiB [built] [code generated]
webpack 5.35.1 compiled successfully in 377 ms
```

如果在页面引入的话发现样式没有生效

通过源码可以发现只是定义了这个模块，加载到 js 代码中，但是没有去使用

我们需要再加上 style-loader 把 css-loader 产生的代码使用上

css -> css-loader -> style-loader -> webpack - bundle.js

我们进行 `yarn add style-loader -D` 然后修改配置文件

这里需要注意的是， loader 配置里面的 use，loader 的顺序是倒序的

```javascript
module.exports = {
  mode: 'none',
  entry: './src/index.css',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
```

重新打包看看。此时发现我们的样式已经生效了

通过源码可以发现 style-loader 会把 css-loader 生成的代码，通过 创建 style 标签，添加到页面上

一般我们还是通过 js 文件作为入口文件，稍微调整下代码和配置文件

```javascript
// webpack.config.js
module.exports = {
  mode: 'none',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

// index.js

import './index.css';
```

这里想想为什么 要把 css 也打包进入 js 代码，不是应该分离吗？

其实想想如果有一个功能开发，我们在 html 代码里面引入 css 文件，然后开发 js 功能

但是后期可能不需要这个 js 模块功能了，我们移除 js 代码模块的同时还要去 html 代码中移除对应的 css 文件，同时维护两条线的成本是很高的

按照 webpack 的做法，所有资源都是 js 来控制，只需要维护我们的 js 代码就好了

## 开发一个 loader

any source -> loader1 -> loader2 -> loader3 -> javascript code

最后返回 js 代码

我们来开发一个简单的 markdown-loader

配置文件如下：

```javascript
module.exports = {
  mode: 'none',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.md$/,
        // 不一定是模块名，也可以是路径
        use: ['./markdown-loader'],
      },
    ],
  },
};
```

看一下我们的 loader 文件，是不是很简单？

```javascript
const marked = require('marked');
module.exports = (source) => {
  console.log(source);

  const html = marked(source);
  const code = `export default ${JSON.stringify(html)}`;
  return code;
};
```

loader 我们最终需要产生一段可执行的 js 代码，如上图

不过我们也可以进行一下变形，我们最终返回的是一段 html 字符串，然后交给下一个 loader 去处理

我们把我们的 loader 改成下面这样

```javascript
const marked = require('marked');
module.exports = (source) => {
  console.log(source);

  const html = marked(source);
  // const code = `export default ${JSON.stringify(html)}`;
  // return code;

  return html;
};
```

增加 html-loader：`yarn add html-loader -D`

调整一下配置文件

```javascript
module.exports = {
  mode: 'none',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.md$/,
        // 不一定是模块名，也可以是路径
        use: ['html-loader', './markdown-loader'],
      },
    ],
  },
};
```

发现也是正常打包运行的

## 总结

loader 机制是 webpack 核心机制

也因为 loader 的机制，整个社区可以添加新的 loader，加载任何资源

万物皆模块～

# 插件

插件机制，主要是增加 webpack 在项目自动化构建方面的能力

loader 是各种资源加载的问题

plugins 是除了打包资源之外其他的构建能力

比如：

- 自动清除 dist 文件
- 自动生成 html 文件
- 根据环境为代码注入类似 api 这种地址可能变化的部门
- 拷贝不需要参与打包的资源文件到指定输出目录
- 压缩打包后的输出文件
- 自动发布打包结果到服务器实现自动部署

## 插件使用

### 目录清除

`yarn add clean-webpack-plugin -D`

修改配置文件

```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
module.exports = {
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [new CleanWebpackPlugin()],
};
```

我们可以调整下输出文件的名字，然后重新打包，可以发现上次产生的文件已经被清除了

### 自动生成 html 文件

`yarn add html-webpack-plugin -D`

可以看看基本的一些配置：

```javascript
// webpack.config.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
module.exports = {
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'webpack plugin sample',
      template: './src/index.html',
    }),
  ],
};
```

```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <div class="container">
      <h1>结构</h1>
      <div id="root"></div>
    </div>
  </body>
</html>
```

打包完之后的代码如下所示：

```html
<!-- dist/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack plugin sample</title>
    <script defer src="main.js"></script>
  </head>
  <body>
    <div class="container">
      <h1>结构</h1>
      <div id="root"></div>
    </div>
  </body>
</html>
```

如果向再生成更多的 html 文件，可以在 plugins 加入

```javascript
new HtmlWebpackPlugin({
  filename: 'about.html',
});
```

不过这里暂时只是用了一个入口，所以 about.html 和 index.html 引用同一个 main.js 文件。我们可以使用多入口来处理

### 文件复制

不需要参与构建的静态文件，比如 favicon robots.txt

可以放在根目录的 public / static 下

我们希望 webpack 打包的时候把这个目录下的文件都复制到输出目录，可以使用 copy-webpack-plugin

`yarn add copy-webpack-plugin -D`

简单的修改下配置

```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
module.exports = {
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'webpack plugin sample',
      template: './src/index.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        // 需要拷贝的路径
        {
          from: 'public',
          to: 'public',
        },
      ],
    }),
  ],
};
```

## 实现一个插件

每一个环节，都预留了一个钩子，我们可以在钩子上进行一些操作或者任务

合适的时机去做合适的事情，类似事件绑定

接下来我们开发移除注释的插件

webpack 要求插件返回的是一个函数，或者包含 apply 方法的类

```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const RemoveCommentsPlugin = require('./remove-comments-plugins');

const path = require('path');
module.exports = {
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'webpack plugin sample',
      template: './src/index.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        // 需要拷贝的路径
        {
          from: 'public',
          to: 'public',
        },
      ],
    }),
    new RemoveCommentsPlugin(),
  ],
};
```

```javascript
class RemoveCommentsPlugin {
  apply(compiler) {
    // compiler 包含了此次构建的所有配置信息
    console.log('remove comments plugin');

    // emit钩子 会在即将生成文件到输出目录之前执行

    // tap 方法注册钩子函数，第一个参数是插件名称，第二个是挂载到这个钩子上的函数

    compiler.hooks.emit.tap('RemoveCommentsPlugin', (compilation) => {
      // compilation 此次打包上下文
      // compilation.assets 资源文件信息
      for (const name in compilation.assets) {
        console.log(name);

        // 文件内容
        // console.log(compilation.assets[name].source());

        if (name.endsWith('.js')) {
          const contents = compilation.assets[name].source();
          const noComments = contents.replace(/\/\*{2,}\/\s?/g, '');
          compilation.assets[name] = {
            source: () => noComments,
            size: () => noComments.length,
          };
        }
      }
    });
  }
}

module.exports = RemoveCommentsPlugin;
```

# 运行机制和工作原理

各种资源文件，在 webpack 中都是一个资源模块，通过 webpack 打包最终聚集在了一起

整个打包过程中

- 通过 loader 处理特殊资源都加载，比如加载样式，图片
- 通过 plugin 实现各种自动化的构建任务，比如自动压缩，自动发布

工作过程如下：

- 根据配置找到某一个文件作为入口，一般是 js 文件
- 然后根据这个文件中的 import 或者 require 解析推断依赖的资源文件
- 然后继续解析各个资源文件的依赖模块，不断递归下去，最终得到一个依赖关系树
- 根据配置文件的 loader ，去加载模块
- 把加载后的结果放入到 bundle.js 中，实现整个项目的打包

一些图片和字体文件，无法用 js 来表示的，loader 会把它们单独作为资源文件拷贝到输出目录，然后把每个资源文件对应的路径作为模块的导出成员暴露给外部使用

插件机制不会影响核心打包过程。在每个环节预设了钩子，在这些钩子上可以加入我们的自定义的任务，完成我们想要做的事情

## 查阅 webpack 源代码

1. webpack cli 启动打包流程
2. 载入 webpack 模块，创建 complier 对象
3. 使用 complier 对象开始编译整个项目
4. 从入口文件开始，解析模块依赖，形成依赖树
5. 递归依赖树，每个模块交给对应的 loader 处理
6. 合并 loader 的处理完的结果，把打包结果输出到 dist 目录

### webpack cli

webpack 可以通过其他方式使用，并不一定依赖于 webpack cli，所以它们也分离出来了两个爆

webpack cli 的作用是把 cli 的参数和 webpack 配置文件中的配置进行整合，得到一个完整的配置对象

然后载入 webpack 核心模块，传入配置对象，创建了 compiler 对象

options 还可以是一个数组，支持多路打包，不过我们一般是一个对象，单线打包

### compiler 对象

创建好 compiler 对象，开始注册了插件，因为从这里开始 webpack 的生命周期了，我们需要尽早的加载插件

这里也会判断监视模式，会去调用 webpack 的 watch 监视方法，如果没有的话，就开始调用 run 方法

这里会触发 beforeRun 和 run 的钩子函数

然后调用 compile 方法，真正的构建我们的项目

### 开始构建

创建一个 newCompliation 对象，理解成构建过程中的上下文对象，包含了所以的资源信息和额外的信息，触发 make 钩子

### make 阶段

根据 entry 入口模块，递归出所有的依赖，形成依赖树，递归每个模块交给不同的 loader 处理

具体流程是：

- SingleEntryPlugin 调用了 Compilation 对象 addEntry，解析入口
- addEntry 方法中调用 `_addModuleChain` 方法，把入口模块添加到模块依赖列表
- Compilation 对象的 buildModule 方法进行模块构建
- buildModule 方法中执行具体的 loader，处理特殊资源的加载
- build 完成，使用 acorn 库生成对应代码的 ast 语法树
- 根据语法树分析这个模块是否还有依赖的模块，如果有，循环 build 每个依赖
- 所以依赖解析完成， build 阶段结束
- 合并生成需要输出的 bundle.js 写到 dist 目录

# Dev Server 提高本地开发效率

我们虽然可以使用 `webpack --watch` 加上 `browsersync` 工具，实现

- webpack 监听源代码，自动构建
- browsersync 监听 dist 代码，自动刷新浏览器

但是多工具的使用，以及频繁磁盘读写，效率还是低下的

我们可以直接使用官方的 webpack-dev-server 工具

`yarn add webpack-dev-server -D`

执行 `yarn dev`

注意，webpack5 从以前的 `webpack-dev-server` 命令变成了 `webpack serve` 命令

https://stackoverflow.com/questions/40379139/cannot-find-module-webpack-bin-config-yargs

```json
  "scripts": {
    "dev": "webpack serve"
  },
```

我们就可以开启本地调试了

另外 webpack-dev-server 是会把构建的文件写到内存中，所以速度会快很多

可以先简单看一下我们的配置，主要注意里面的注释

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    // 额外的静态资源路径，开发环境先不需要使用 copy-webpack-plugin
    contentBase: 'public',
    proxy: {
      // http://localhost:8080/api/users => https://api.github.com/users
      '/api': {
        target: 'https://api.github.com',
        pathRewrite: {
          '^/api': '', // 替换掉代理地址中的 /api
        },
        changeOrigin: true, // 确保请求 GitHub 的主机名是 api.github.com
      },
    },
  },
};
```

# source map

## 前言

开启 source map

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
};
```

还支持很多其他选项。我们先看看现在这种情况生成的代码

```javascript
/******/ (() => {
  // webpackBootstrap
  var __webpack_exports__ = {};
  /*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
  console.log('demo');

  /******/
})();
//# sourceMappingURL=main.js.map
```

我们的 dist/main.js 如上面的代码，最后指向了我们的 map 文件，它的内容如下：

```json
{
  "version": 3,
  "sources": ["webpack://demo-4/./src/index.js"],
  "names": [],
  "mappings": ";;;;;AAAA",
  "file": "main.js",
  "sourcesContent": ["console.log('demo');\n"],
  "sourceRoot": ""
}
```

## 深入了解

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

const allModes = [
  'eval',
  'eval-cheap-source-map',
  'eval-cheap-module-source-map',
  'eval-source-map',
  'cheap-source-map',
  'cheap-module-source-map',
  'source-map',
  'inline-cheap-source-map',
  'inline-cheap-module-source-map',
  'inline-source-map',
  'eval-nosources-cheap-source-map',
  'eval-nosources-cheap-module-source-map',
  'eval-nosources-source-map',
  'inline-nosources-cheap-source-map',
  'inline-nosources-cheap-module-source-map',
  'inline-nosources-source-map',
  'nosources-cheap-source-map',
  'nosources-cheap-module-source-map',
  'nosources-source-map',
  'hidden-nosources-cheap-source-map',
  'hidden-nosources-cheap-module-source-map',
  'hidden-nosources-source-map',
  'hidden-cheap-source-map',
  'hidden-cheap-module-source-map',
  'hidden-source-map',
];

module.exports = allModes.map((item) => ({
  mode: 'none',
  devtool: item,
  output: {
    filename: `js/${item}.js`,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: `${item}.html`,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
}));
```

我们通过上面的配置文件，可以生成所有模式下打包出来的代码文件，然后再一个个来分析

不过也只是分析一些主要常用的

### eval

生成的代码通过 eval 来执行，也没有生成对应的 map 文件。只能定位文件，浏览器看到的也是经过 webpack 处理后的代码，而不是源代码

### eval-source-map

对比 eval 模式，它会生成 source map 信息，可以定位到源代码的位置。但是看到 source map 信息是在打包后的文件里面的

### eval-cheap-source-map

阉割版的 eval-source-map，只能定位到行，不能定位到列

构建速度快很多

### eval-cheap-module-source-map

名字带有 module 的模式，解析出来的源代码是没有经过 loader 处理的

名字不带 module 的模式，解析出来的是经过 loader 处理加工后的

所以看到我们加了 babel-loader

所以如果我们想要和源代码一模一样的话，就需要选择这种带有 module 的模式

### inline-source-map

和普通 source-map 效果一样，但是文件以 data urls 的形式存在，和上面的 eval-source-map 一样

### hide-source-map

开发工具看不到 source map 效果，但是确实生成了 source map 文件，代码没有引用

### nosources-source-map

可以看到错误出现的位置，但是点进去看不到源代码

为了保护生产环节下不暴露源代码

## 选择

开发环境选择 eval-cheap-module-source-map

- 选择框架比较多，loader 转化后的代码差异大，我们更希望调试 loader 转换前的
- 不需要列的信息，有行信息就能比较好的定位到，省略列信息可以提升构建速度
- 启动打包慢，但是配合 webpack-dev-server 都是在监视模式下重新打包，重新打包速度很快

现网环境

- 最好不使用 source map 避免源代码的泄漏
- 如果确实有需要，建议开启 nosources-source-map 模式，能定位到错误的地方，也能不暴露源码

最后 webpack 和 source map 的关系，也只是 webpack 支持 source map，而不是 webpack 独有的功能
