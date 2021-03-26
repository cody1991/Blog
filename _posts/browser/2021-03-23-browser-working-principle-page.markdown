---
layout: post
title: 《浏览器工作原理与实践》系列笔记 - 浏览器中的页面
tags: [browser]
---

# 页面性能分析：利用 chrome 做 web 性能分析

## Chrome 开发者工具

包含了 10 个功能面板，包括了 Elements、Console、Sources、NetWork、Performance、Memory、Application、Security、Audits 和 Layers

提供了访问编辑 DOM 和 CSSOM 的能力，也提供了强大的调试和性能指标工具

## 网络面板

由控制器、过滤器、抓图信息、时间线、详细列表和下载信息概要这 6 个区域构成

![](/img/posts/browser/page/1.png)

### 控制器

![](/img/posts/browser/page/2.png)

### 过滤器

选择自己想看的文件类型等

### 抓图信息

可以看到用户等待加载时看到的画面，分析用户的体验

### 时间线

HTTP HTTPS WebSocket 加载的状态和时间的关系，直观感受页面加载过程。如果多个堆叠在一起代表同时加载，具体需要到下面的文件列表查看

### 详细列表

每个资源发起到完成请求的所有过程状态信息，最终完成的数据信息

### 下载信息摘要

关注 DOMContentLoaded 和 Loaded 两个事件的时间

- DOMContentLoaded 代表 DOM 构建好了，所需要的 HTML CSS JavaScript 都下载完成了
- Loaded 代表加载完所有的资源了

## 网络面板中的详细列表

每个文件的信息都是非常详细的：

![](/img/posts/browser/page/3.png)

我们看下单个资源的时间线，这里涉及到了 HTTP 请求流程

![](/img/posts/browser/page/4.png)

- 查找是否有缓存
- DNS 获取 IP 地址
- 建立 TCP 连接
- 发送 HTTP 请求
- 响应头如果包含重定向，直接走回开始的步骤
- 否则接收返回数据

![](/img/posts/browser/page/5.png)

这里面每一项是什么意思呢？

首先看看 Queuing 是排队的时间，发起一个请求有时候并不能立刻发送，需要等待，有很多原因导致的

- 页面资源有优先级， CSS、HTML、JavaScript 是核心数据，优先级最高，图片、视频、音频这类资源就不是核心资源，优先级比较低，所以后者一般需要让路，进入待排队状态
- 浏览器维护了 6 个 TCP 连接，如果发起这个请求的时候都处于忙绿状态，则进入待排队状态
- 为数据分配磁盘空间也需要等待磁盘空间分配完成

等待排队完以后，进行发起连接状态，这个时候也有可能会推迟，叫做 Stalled，停滞的意思

然后是 Initial connection/SSL ，服务器建立连接的时间，包括 TCP 连接的时间，如果是 HTTPS 还有 SSL 握手的时间，协商一些加密的信息

建立好以后准备请求数据，发送给网络，就是 Request sent 阶段了，这个阶段很快，只要把浏览器缓冲区的数据发送出去就好了，一般不到 1ms

接下来就是等待服务器第一个字节的数据，称之为 TTFB，第一字节时间，是反应服务器响应速度的指标，TTFB 越短响应越快

后面进入完整数据接收状态 Content Download ，这是第一个字节到全部接收完成的时间

## 优化时间线上耗时项

### 排队时间过长 Queuing

大概是每个域名只能有 6 个 TCP 连接导致的，我们可以在一个站点下放多个资源域名，这叫做分片技术。但是更加建议升级到 HTTP/2，通过多路复用没必要最多维护 6 个 TCP 连接的限制了

### TTFB 过久

- 可能是服务器生成的数据时间过长
- 网络问题
- 发送请求头有多余的用户信息，一些不必要的 cookie 等

解决方案有下面一些

- 可以提高服务器的处理性能，也可以缓存服务器处理的结果
- 第二个问题，可以通过 CDN 来缓存静态文件
- 减去不必要的头信息，压缩头部信息

### Content Download 过久

字节数太多了，减少文件大小，比如压缩，去掉源码中不必要的地方

## 总结

- 介绍了 Chrome 开发者工具 10 个基础的面板信息
- 剖析了网络面板，再结合之前介绍的网络请求流程来重点分析了网络面板中时间线的各个指标的含义
- 简要分析了时间线中各项指标出现异常的可能原因，并给出了一些优化方案

如果你要去做一些实践性的项目优化，理解其背后的理论至关重要。因为理论就是一条“线”，它会把各种实践的内容“串”在一起，然后你可以围绕着这条“线”来排查问题

# DOM 树：JavaScript 是如何影响 DOM 树构建的

DOM 树是怎么生成的，说下 DOM 树的解析流程

然后说下遇到 JS 脚本，DOM 解析器会怎么处理，另外还有 DOM 解析器是怎么处理跨站资源的

## DOM

网络传给渲染引擎的 HTML 无法被引擎理解，要转成能理解的内部结构，就是 DOM 了

DOM 提供了 HTML 文档结构化的表述，它有三个作用

- DOM 是生成页面的基础结构
- DOM 提供了 JS 脚本操作的接口，JS 可以对 DOM 结构进行访问，改变文档的结构样式内容
- DOM 是安全防护线，不安全的内容在 DOM 解析的时候会去掉

## DOM 树如何生成

渲染引擎内部有个 HTML 解析器，负责把 HTML 字节流转成 DOM 结构

首先 HTML 解析器不会等等这个文档加载完毕在解析，加载了多少，HTML 就解析多少

网络接收到响应头判断 content-type 为一个 HTML 文件的时候，为该请求分配一个渲染进程，网络进程和渲染进程会有一个共享数据的通道，网络进程接收数据就往这个通道写数据，渲染进程源源不断的读数据，然后塞给 HTML 解析器

字节流是怎么转成 HTML 的呢？

![](/img/posts/browser/page/6.png)

一共有三个阶段

### 分词器把字节流转成 Token，分为 Tag Token（startTag, endTag） 和文本 Token

上面的代码会变成下图这样：

![](/img/posts/browser/page/7.png)

### 同步进行二三步骤，Token 解析为 DOM 节点，DOM 节点加到 DOM 树

HTML 解析器维护了一个 Token 栈结构，该 Token 栈主要用来计算节点之间的父子关系，在第一个阶段中生成的 Token 会被按照顺序压到这个栈

- 如果押入栈的是 start token,HTML 解析器会为该 Token 创建一个 DOM 节点，加入到 DOM 树，父节点就是当前栈顶的 DOM 节点
- 如果是文本 token，生成文本节点，加入到 DOM 树，文本节点不需要押入栈
- 如果是 end token，检查栈顶元素是否是 start tag，如果是，star tag 弹出，标识解析完了

新 Token 就这样不停地压栈和出栈，整个解析过程就这样一直持续下去，直到分词器将所有字节流分词完成

我们看看下面这段代码

```html
<html>
  <body>
    <div>1</div>
    <div>test</div>
  </body>
</html>
```

第一个是 start tag html，押入栈中，创建一个 html dom 节点，加入 dom 树

另外默认创建一个根为 document 的空 DOM，同时吧 start tag document 的 token 压入到栈，创建一个 html dom 节点，添加到 document 上

比如下图

![](/img/posts/browser/page/8.png)

然后按照相同的流程，解析 start tag body 和 start tag div

![](/img/posts/browser/page/9.png)

然后创建 第一个 div 的文本 token，添加到 dom，父元素就是栈顶的元节点

![](/img/posts/browser/page/10.png)

解析出第一个 end tag div，判断栈顶是不是 start tag div，是的话弹出

![](/img/posts/browser/page/11.png)

最终我们得到了下图

![](/img/posts/browser/page/12.png)

现实中包含了很多其他的元素，我们继续往下看

## JavaScript 如何影响 DOM 生成

```html
<html>
  <body>
    <div>1</div>
    <script>
      let div1 = document.getElementsByTagName('div')[0];
      div1.innerText = 'time.geekbang';
    </script>
    <div>test</div>
  </body>
</html>
```

script 标签之前，所有的解析流程还是和之前介绍的一样，但是解析到 script 标签时，渲染引擎判断这是一段脚本，此时 HTML 解析器就会暂停 DOM 的解析，因为接下来的 JavaScript 可能要修改当前已经生成的 DOM 结构

![](/img/posts/browser/page/13.png)

解析到 JS 的时候，如上图

这里 JS 接入，执行脚本，修改了 DOM 第一个 div 的内容

执行完以后，HTML 解析器恢复解析

如果加入的是 外部的 JS 文件

```html
<html>
  <body>
    <div>1</div>
    <script type="text/javascript" src="foo.js"></script>
    <div>test</div>
  </body>
</html>
```

和上面的流程基本一样，但是需要先下载 JS。

需要注意下载环境，文件下载会阻塞 dom 解析，因为下载过程会阻塞 dom 解析，通常也是耗时的

不过 Chrome 做了一些优化，主要的优化手段是预解析的操作

渲染引擎收到字节码后，开启一个预解析线程，分析 HTML 文件是否有 JS CSS 等文件，解析道的话预解析线程会提前下载

我们可以用一些策略来规避这些问题，比如 cdn 加速 js 文件加载，压缩 js 体积，另外如果没有操作 dom 结构的代码可以设置为 异步加载，通过 async 或者 defer 标记

```html
<script async type="text/javascript" src="foo.js"></script>
<script defer type="text/javascript" src="foo.js"></script>
```

它们有一点区别， async 的脚本一旦加载完成，就会立即执行

defer 的脚本需要在 DomContentLoaded 事件结束前执行

另外在执行 js 前，也需要先解析 js 语句之上所有的 css 样式，如果引用了外部的 css 文件，还要等待 css 文件下载完成，解析成 cssom 才可以执行

js 引擎在解析 js 之前不知道是否操作了 cssom，所以不管是否执行了 cssom，都会执行 css 文件下载，解析操作，再执行 js 脚本

所以 js 脚本依赖样式表，这又多了一个阻塞的过程

于是我们知道了 js 会阻塞 dom 生成，样式文件又会阻塞 js 执行，所以实际工程中要关注 js 文件和样式表文件，使用不当会影响页面性能

## 总结

额外说明，渲染引擎还有一个安全检查模块叫做 xssAuditor 用来检测词法安全，分词器解析出来 token 以后，检测这些模块是否安全，比如引用外部的脚本是否符合 csp 规范，是否存在跨站点请求

如果出现不规范的，xssAuditor 会对脚本或者下载任务进行拦截

# 渲染流水线：CSS 如何影响首次加载时的白屏时间？

本文站在渲染流水线的视角介绍 css 如何工作，css 的工作流程来分析性能瓶颈，最后再讨论如何减少首次加载白屏

看一段简单的代码

```css
/* theme.css */
div {
  color: coral;
  background-color: black;
}
```

```html
<html>
  <head>
    <link href="theme.css" rel="stylesheet" />
  </head>
  <body>
    <div>🐶 14 🐱</div>
  </body>
</html>
```

![](/img/posts/browser/page/14.png)

- 主页面发起请求
- 网络进程执行。请求到 html 数据后，发给渲染进程
- 渲染进程解析 HTML 数据并构建 DOM（看到存在一定的空闲时间，可能成为渲染瓶颈）

渲染进程接收到 HTML 会先开启预解析线程，如果遇到 js 或者 css 会提前下载这些数据

- 所以预解析线程解析出一个外部的 theme.css，发起请求
- dom 构建结束，但是 theme.css 还没下载好，这里也有一段空闲的时间，可能成为瓶颈
- 合成布局树，需要 cssom 和 dom，这里要等 css 加载结束解析成 cssom

## 渲染流水线为什么需要 cssom

浏览器也无法解决 css 文件内容，要把它解析成渲染引擎可以理解的，就是 cssom 结构

它第一个功能室给 js 操作样式表的能力，另外一个是布局树合成提供的基础信息样式

cssom 体现在 dom 中就是 document.styleSheets
