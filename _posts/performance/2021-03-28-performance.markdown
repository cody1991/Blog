---
layout: post
title: 前端性能优化总结
tags: [Performance]
from: https://juejin.cn/post/6844904168373633032
---

# 页面请求流程

从用户输入 URL 地址栏到内容显示到界面上做了哪些事情，来进行性能优化的分析讨论

1. 浏览器向 DNS 服务器发起解析 URL 地址中域名对应的 IP 地址的请求
2. 通过三次握手建立 TCP 连接
3. 浏览器组装 HTTP 请求报文，发起请求文件的 HTTP 请求
4. 服务器对浏览器的请求作出响应，把对应的 HTML 文件返回给浏览器
5. 浏览器解析 HTML 文件内容，显示对应的内容（具体的解析过程后面讨论）
6. 通过四次挥手，释放 TCP 连接

## DNS 解析

把域名解析为对应的 IP 地址，才可以在后面发起 TCP 请求

DNS 的请求顺序为

- 本地缓存
- 浏览器缓存
- 本机的 DNS 缓存
- 路由器的 DNS 缓存
- 运营商的服务器 DNS 缓存（80%的 DNS 缓存查询在这里）
- 递归查询

优化手段：dns 解析一般需要 20 ～ 120ms，尽可能允许使用浏览器缓存，能节省大量的时间，我们也会使用 dns-prefetch 来提前解析 DNS 并放在缓存中

## TCP 连接建立

这块没什么优化的手段说的，来看看三次握手的过程

1. 服务器和浏览器会发送 SYN(同步序列编号) 和 ACK(确认字符)
2. 第一次握手 🤝：浏览器把 SYN 设置为 1，随机产生一个值 seq=J，把数据包发给服务器，浏览器进入 `CLIENT_SENT` 阶段，等待服务器确认
3. 第二次握手 🤝：服务器收到数据包后发现 SYN 是 1，知道浏览器请求建立连接，服务器把 SYN 和 ACK 都置为 1，ack=J+1，随机产生一个 seq=k，并把数据包发给浏览器，确认连接请求，服务器进入 `SYN_RCVD` 阶段
4. 第三次握手 🤝：浏览器接收到以后，检查 ack 是否为 J+1，ACK 是否为 1 如果正确把 ACK 置为 1，ack=K+1，并把数据包发给服务器。服务器检查 ack 是否为 K+1，如果是的话确认连接建立。服务器和浏览器都进入 `ESTABLISHED` 状态，完成了三次握手，随后进入数据传输阶段

## 浏览器发起请求

这里有很多优化的地方可以做

### keep alive 使用

HTTP 协议通信最耗时的部分在建立 TCP 连接，我们可以使用 HTTP 请求头中指定 `Connection: Keep-Alive`

在早起 HTTP/1.0 每个 HTTP 请求都需要打开一个 TCP 连接，使用完一次之后就断开这个 TCP 连接

HTTP/1.1 改善了这种情况，在一次 TCP 连接中可以多个 HTTP 请求而不会断开，现在也是默认开启的

通过这种机制，可以减少 TCP 的连接次数，意味着更少的 `TIME_WAIT` 状态连接，达到提高性能和提升服务器吞吐率

但是长时间的 TCP 连接容易导致系统资源的无效占用，如果配置不当的 keep alive 可能导致其他更大的损失，因为 HTTP 传送完最后一个响应的时候还是维持 keepalive_timeout，才会真正去关闭

### 使用 websocket

仅一次 TCP 连接就可以一直保持，对二进制的数据传输也有更好的支持，可以用于即时通信和海量高并发的情景

### 减少 HTTP 请求的次数

HTTP 请求头部和响应头部，多次的传输会重复传输重复的信息，把它们打包在一起进行传输

### 配置使用懒加载

主要是针对图片的懒加载

### 服务器的资源部署尽量同源

比如后台的请求，同源可以减少 CORS 的预检查 options 的请求时间

### 需要多个 cookie 识别用户的场景

使用 session 代替，把信息存储在服务器，只要传输标识的 cookie，节省大量的无效传输

### preload , dns-prefetch , prefetch

预请求资源，它们不会阻塞浏览器的解析，也能把预请求回来的信息缓存起来，这样不会推迟首屏的时间，能提到加速后面展示的时间

### defer async

使用 defer 和 async 属性的脚本，采用异步加载的方式，会先发起请求，但是先不执行

async：无序加载脚本，谁先请求回来就先执行谁，请求回来的时候无论 DOM 解析还是 脚本解析中，接下来都会先解析这个脚本，它会阻塞 DOM 的解析
defer：在 DOMContentLoad 前加载，但是加载之前所有的 DOM 解析肯定已经完成了，不会阻塞 DOM 的解析，也叫做延迟脚本

## 服务器返回响应信息，浏览器接受到响应数据

### Nginx

nginx 是一款轻量级的 Web 服务器，反向代理服务器及电子邮件（IMAP/POP3）代理服务器。其特点是占有内存少，并发能力强，事实上 nginx 的并发能力确实在同类型的网页服务器中表现较好

nginx 安装非常的简单，配置文件非常简洁，BUG 很少的服务器。nginx 启动特别容易，并且几乎可以做到 `7*24` 不间断运行，即使运行数个月也不需要重新启动，能够不间断服务的情况下进行软件版本的升级

还可以解决跨域，进行请求过滤，配置 Gzip 压缩，负载均衡，作为静态资源服务器 等

#### 负载均衡

把服务窗口想像成我们的后端服务器，而后面终端的人则是无数个客户端正在发起请求。

负载均衡就是用来帮助我们将众多的客户端请求合理的分配到各个服务器，以达到服务端资源的充分利用和更少的请求时间

Upstream 指定后端服务器地址列表

```
upstream balanceServer {
  server 10.1.22.33:12345;
  server 10.1.22.34:12345;
  server 10.1.22.35:12345;
}
```

在 server 中拦截响应请求，并将请求转发到 Upstream 中配置的服务器列表

```
server {
  server_name  fe.server.com;
  listen 80;
  location /api {
    proxy_pass http://balanceServer;
  }
}
```

默认情况下采用的策略，将所有客户端请求轮询分配给服务端。

这种策略是可以正常工作的，但是如果其中某一台服务器压力太大，出现延迟，会影响所有分配在这台服务器下的用户

而最小连接数策略将请求优先分配给压力较小的服务器，它可以平衡每个队列的长度，并避免向压力大的服务器添加更多的请求

```
upstream balanceServer {
  least_conn; //配置压力较小的服务器
  server 10.1.22.33:12345;
  server 10.1.22.34:12345;
  server 10.1.22.35:12345;
}
```

依赖于 NGINX Plus，优先分配给响应时间最短的服务器

```
upstream balanceServer {
  fair; //配置响应时间最短的服务器
  server 10.1.22.33:12345;
  server 10.1.22.34:12345;
  server 10.1.22.35:12345;
}
```

来自同一个 ip 的请求永远只分配一台服务器，有效解决了动态网页存在的 session 共享问题

```
upstream balanceServer {
    ip_hash; // 配置1个IP永远只分配一台服务器
    server 10.1.22.33:12345;
    server 10.1.22.34:12345;
    server 10.1.22.35:12345;
}
```

配置静态资源服务器，比如：

匹配以 `png|gif|jpg|jpeg` 为结尾的请求，将请求转发到本地路径，root 中指定的路径即 nginx 本地路径。同时也可以进行一些缓存的设置。

```
location ~* \.(png|gif|jpg|jpeg)$ {
    root       /root/static/;
    autoindex  on;
    access_log off;
    expires    10h; # 设置过期时间为10小时
}
```

#### 跨域问题解决

比如 前端 server 的域名为：fe.server.com，后端服务的域名为：dev.server.com

现在我在 fe.server.com 对 dev.server.com 发起请求一定会出现跨域。

现在我们只需要启动一个 nginx 服务器，将 server_name 设置为 fe.server.com,

然后设置相应的 location 以拦截前端需要跨域的请求，最后将请求代理回 dev.server.com。

如下面的配置：

```
server {
  listen       80;
  server_name  fe.server.com;
  location / {
    proxy_pass dev.server.com;
  }
}
```

完美绕过浏览器的同源策略：fe.server.com 访问 nginx 的 fe.server.com 属于同源访问，而 nginx 对服务端转发的请求不会触发浏览器的同源策略。

#### 配置 GZip

GZip 是三种标准的压缩方式之一，绝大部分的网站都用它来压缩 HTML CSS JavaScript 等资源

对于文本内容，GZip 的效果非常明显，所需流量大约会降至 1/4 ~ 1/3

开启 GZip 最低的 HTTP 要求是 1.1 版本

需要服务器和浏览器同时支持，如浏览器支持 GZip 解析，服务器返回 GZip 压缩过的文件就可以了。通过 nginx 的配置来让服务端支持 GZip，通过 Respone 中 Content-Encoding 设置为 Gzip，指服务端开启了 GZip 的压缩方式

## 解析 HTML 文件，绘制渲染页面

- 预解析器，会预解析 HTML 文件，把一些 CSS 和 JavaScript 文件请求回来
- 从上到下开始解析 HTML 文件，调用 HTML 解析器把 HTML 代码解析成 DOM 节点
- 调用 CSS 解析器把 CSS 代码解析成 CSSOM
- Link 会阻塞 HTML 的解析，我们可以把样式代码进行内联
- DOM 和 CSSOM 结合，通过样式计算，形成 布局树
- 布局树通过分层信息，形成 层树
- 浏览器开始根据层数进行绘制，绘制是一条条的绘制指令
- 传给合成线程进行光栅化，光栅化是分块的，也可以通过 GPU 加速
- 把处理后的信息返回给显卡去显示

### 一些优化策略

图片比较多的时候一定要进行懒加载，图片是最需要优化的

webpack4 配置 代码分割，提取公共代码成单独模块。方便缓存

```js
const someConfig = {
  /*
    runtimeChunk 设置为 true, webpack 就会把 chunk 文件名全部存到一个单独的 chunk 中
    这样更新一个文件只会影响到它所在的 chunk 和 runtimeChunk，避免了引用这个 chunk 的文件也发生改变。
  */
  runtimeChunk: true,
  splitChunks: {
    chunks: 'all', // 默认 entry 的 chunk 不会被拆分, 配置成 all, 就可以了
  },
};
```

## TCP 四次挥手，断开连接

# 让页面更加流畅

## 使用 requestAnimationFrame

即便你能保证每一帧的总耗时都小于 16ms，也无法保证一定不会出现丢帧的情况，这取决于触发 JS 执行的方式

假设使用 setTimeout 或 setInterval 来触发 JS 执行并修改样式从而导致视觉变化，那么会有这样一种情况，因为 setTimeout 或 setInterval 没有办法保证回调函数什么时候执行，它可能在每一帧的中间执行，也可能在每一帧的最后执行

所以会导致即便我们能保障每一帧的总耗时小于 16ms，但是执行的时机如果在每一帧的中间或最后，最后的结果依然是没有办法每隔 16ms 让屏幕产生一次变化

也就是说，即便我们能保证每一帧总体时间小于 16ms，但如果使用定时器触发动画，那么由于定时器的触发时机不确定，所以还是会导致动画丢帧

现在整个 Web 只有一个 API 可以解决这个问题，那就是 requestAnimationFrame，它可以保证回调函数稳定的在每一帧最开始触发

## 避免 FSL，强制同步布局

先执行 JS，然后在 JS 中修改了样式从而导致样式计算，然后样式的改动触发了布局、绘制、合成

但 JavaScript 可以强制浏览器将布局提前执行，这就叫 强制同步布局 FSL

比如

```js
//读取offsetWidth的值会导致重绘
const newWidth = container.offsetWidth;
```

设置 width 的值会导致重排，但是 for 循环内部代码执行速度极快，当上面的查询操作导致的重绘还没有完成，下面的代码又会导致重排，而且这个重排会强制结束上面的重绘，直接重排，这样对性能影响非常大。

所以我们一般会在循环外部定义一个变量

```js
// 这里面使用变量代替 container.offsetWidth;
boxes[i].style.width = newWidth + 'px';
```

## transform 属性

使用 transform 属性去操作动画，这个属性是由合成器单独处理的，所以使用这个属性可以避免布局与绘制。

## translateZ(0)

使用 translateZ(0)开启图层，减少重绘重排

创建图层的最佳方式是使用 will-change，但某些不支持这个属性的浏览器可以使用 3D 变形（transform: translateZ(0)）来强制创建一个新层

## 样式的切换最好提前定义好 class

通过 class 的切换批量修改样式，避免多次重绘重排

## 先切换 display:none 再修改样式

## 多次的 append 操作可以先插入到一个新生成的元素中，再一次性插入到页面中

## localstorage 和 sessionstorage 使用

把这些数据在内存中存储一份，这样只要可以直接从内存中读书，速度更快，性能更好
