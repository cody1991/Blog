---
layout: post
title: 手动实现一些函数
tags: [JavaScript]
---

这里主要是动手去实现一些常见的函数，也是面试题经常考的

from [awesome-coding-js](http://www.conardli.top/docs/JavaScript/%E9%98%B2%E6%8A%96.html#%E5%8E%9F%E7%90%86)

# 手动实现 call apply bind

```javascript
// 上下文 context 默认为 window
Function.prototype.myCall = function (context = window, ...args) {
  if (this === Function.prototype) {
    return undefined; // 防止 Function.prototype.mycall 直接调用
  }
  context = context || window;
  const fn = Symbol(); // 用 symbol 创建一个Symbol属性保证不重复，把当前函数复制给它
  context[fn] = this; // this 代表当前函数
  const result = context[fn](...args); // 传递第一个参数以后的所有参数
  delete context[fn]; // 调用后删除这个属性
  return result;
};

console.log.myCall(null, "hello", "world");
// hello
```

```javascript
Function.prototype.myApply = function (context = window, args) {
  if (this === Function.prototype) {
    return undefined;
  }
  context = context || window;
  const fn = Symbol();
  context[fn] = this;
  let result;
  if (Array.isArray(args)) {
    result = context[fn](...args);
  } else {
    result = context[fn]();
  }
  return result;
};
console.log.myApply(null, ["hello", "world"]);
```

```javascript
Function.prototype.myBind = function (context, ...args1) {
  if (this === Function.prototype) {
    return new TypeError("Error");
  }
  const _this = this;

  return function F(...args2) {
    // 判断是否用于构造函数
    if (this instanceof F) {
      return new _this(...args1, ...args2);
    }
    return _this.apply(context, args1.concat(args2));
  };
};

function fn(a, b, c) {
  return a + b + c;
}

const _fn = fn.myBind(null, 10);
const ans = _fn(20, 30);
console.log(ans); // 60

function Person(name, age) {
  this.name = name;
  this.age = age;
}

const _Person = Person.myBind(null, "codytang");
const person = new _Person(30);
console.log(person); // Person {name: "codytang", age: 30}
```

# EventEmitter

Nodejs 的 EventEmitter 就是观察者模式的典型实现，Nodejs 的 events 模块只提供了一个对象： `events.EventEmitter`。EventEmitter 的核心就是事件触发与事件监听器功能的封装。

> Node.js 里面的许多对象都会分发事件：一个 net.Server 对象会在每次有新连接时触发一个事件， 一个 fs.readStream 对象会在文件被打开的时候触发一个事件。 所有这些产生事件的对象都是 events.EventEmitter 的实例

- addListener(event, listener)

为指定事件添加一个监听器，默认添加到监听器数组的尾部。

- removeListener(event, listener)

移除指定事件的某个监听器，监听器必须是该事件已经注册过的监听器。它接受两个参数，第一个是事件名称，第二个是回调函数名称。

- setMaxListeners(n)

默认情况下， EventEmitters 如果你添加的监听器超过 10 个就会输出警告信息。 setMaxListeners 函数用于提高监听器的默认限制的数量。

- once(event, listener)

为指定事件注册一个单次监听器，即 监听器最多只会触发一次，触发后立刻解除该监听器。

- emit(event, [arg1], [arg2], [...])

按监听器的顺序执行执行每个监听器，如果事件有注册监听返回 true，否则返回 false。

```javascript
// 基本使用
const evnets = require("events");
const eventEmitter = new evnets.EventEmitter();

const listener01 = () => console.log("监听 listener01");

const listener02 = () => console.log("监听 listener02");

eventEmitter.addListener("connect", listener01);
eventEmitter.addListener("connect", listener02);

eventEmitter.emit("connect");
eventEmitter.emit("connect");
```

自己实现一个

```javascript
function EventEmitter() {
  this._maxListener = 10;
  this._events = Object.create(null); // 纯净的 {} 空对象
}

EventEmitter.prototype.addListener = (type, listener, prepend) => {
  if (!this._events) {
    this._events = Object.create(null);
  }

  if (this._events[type]) {
    if (prepend) {
      this._events[type].unshift(listener);
    } else {
      this._events[type].push(listener);
    }
  } else {
    this._events[type] = [listener];
  }
};

EventEmitter.prototype.removeListener = (type, listener) => {
  if (Array.isArray(this._events[type])) {
    if (!listener) {
      delete this._events[type];
    } else {
      // e.origin 主要在下面的 once 中定义了
      this._events[type] = this._events[type].filter(
        (e) => e !== listener && e.origin !== listener
      );
    }
  }
};

EventEmitter.prototype.once = function (type, listener) {
  const only = (...args) => {
    listener.apply(this, args);
    this.removeListener(type, listener);
  };
  only.origin = listener;
  this.addListener(type, only);
};

EventEmitter.prototype.emit = (type, ...args) => {
  if (Array.isArray(this._events[type])) {
    this._events[type].forEach((fn) => fn.apply(this, args));
  }
};

EventEmitter.prototype.setMaxListeners = function (count) {
  this.maxListeners = count;
};

const eventEmitter = new EventEmitter();

const listener01 = () => console.log("监听 listener01");

const listener02 = () => console.log("监听 listener02");
const listener03 = () => console.log("监听 listener03", 1, 2, 3);

eventEmitter.addListener("connect", listener01);
eventEmitter.addListener("connect", listener02);
eventEmitter.once("connect", listener03);

eventEmitter.emit("connect");
eventEmitter.emit("connect");
```

JS 也有自定义的事件

```javascript
// DOM也提供了类似上面EventEmitter的API

//1、创建事件,参数为事件的名字
const myEvent = new Event("myEvent");

//2、给元素注册事件监听器
document.body.addEventListener("myEvent", () => console.log(1));

//3、触发事件
document.body.dispatchEvent(myEvent);
```
