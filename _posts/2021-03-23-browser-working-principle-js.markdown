---
layout: post
title: 《浏览器工作原理与实践》系列笔记 - 浏览器中的JavaScript执行机制
tags: [browser]
---

# JavaScript 代码的执行流程

# 变量提升：JavaScript 代码是按顺序执行的吗

主要讨论这段代码：

```js
showName();
console.log(myName);
var myName = 'miaomiaomiao';
function showName() {
  console.log('函数showName被执行');
}
```

“变量提升” 以为变量和函数的声明会在物理层面上移到最前面。但是实际上代码的位置是没有变化的，而是在编译阶段被 JavaScript 引擎放到了内存。编译完成以后，进入执行阶段

![](/img/posts/browser/js/1.png)

### 编译阶段

编译阶段和函数提升有什么区别？

我们可以把上面那段代码看成下面这样

变量提升的代码

```js
var myName = undefined;
function showName() {
  console.log('函数showName被执行');
}
```

执行部分的代码

```js
showName();
console.log(myName);
myName = 'miaomiaomiao';
```

如下图所示

![](/img/posts/browser/js/2.png)

所以经过编译以后，产生两个部分的内容：执行上下文(Execution context) 和可执行的代码

执行上下文是 JavaScript 代码执行的运行环境，比如调用一个函数，就会进入到这个函数的执行上下文，确定函数在执行期间用到的比如函数，this，变量等

在执行上下文存在一个变量环境对象(Variable Enviroment)，保存了变量提升的内容，比如上面的 myName 和 showName

简单看成下面的结构

```
Variable Enviroment:
  myName -> undefined
  showname -> function: { consol.log(myName) }
```

我们具体看看上面的代码是怎么生成环境变量的

- 1，2 行都不是声明操作，不作处理
- 3 是 var 声明，JavaScript 引擎为环境变量创建一个 myName 的属性，赋值为 undefined
- 4 发现了一个函数声明，把函数存储到堆中，并给环境变量创建一个 showName 的属性，然后指向了堆中函数的位置。生成了我们的环境变量对象。声明以外的代码编译为字节码进行后续处理

### 执行阶段

- 执行 showName 函数，在环境变量查找该函数，因为环境变量存在该函数的引用，JavaScript 开始执行代码，并输出语句
- 接下来打印 myName，也在环境变量中查找该对象，由于环境变量中存在这个对象，值为 undefined，所以输出 undefined
- 把字符串赋值给 myName，因为环境变量中存在 myName，直接赋值给它

```
Variable Enviroment:
  myName -> 'miaomiaomiao'
  showname -> function: { consol.log(myName) }
```

其实编译和执行是很复杂的，包括了词法分析、语法解析、代码优化、代码生成。这里只是简单阐述下

## 代码中出现相同的变量或者函数怎么办？

我们看看下面的代码

```js
function showName() {
  console.log('🐶');
}
showName();
function showName() {
  console.log('🐱');
}
showName();
```

我们分析下上面代码的执行

- 编译阶段：遇到第一个 showName ，把函数体存在了环境变量，又遇到了第二个 showName，因为环境变量已经存在一个了，第二个会把第一个覆盖掉，所以环境变量里面只有第二个的声明了
- 执行阶段：执行第一个 showName，从环境变量中找到，打印 🐱，第二个也是相同的流程，所以也是打印 🐱

所以相同的函数名生效的是最后一个

## 总结

- JavaScript 执行代码，先进行变量提升，之所以需要执行变量提升，是因为在执行前需要编译。编译阶段函数和变量会存到环境变量中，变量默认值是 undefined，代码执行阶段 JavaScript 引擎会从环境变量中查找变量和函数
- 编译过程中如果有相同的函数，后面的覆盖前面的
- 记住，先编译，在执行

## 思考时间

```js
showName();
var showName = function () {
  console.log(2);
};
function showName() {
  console.log(1);
}
showName();
```

编译阶段：

```js
var showName;
function showName() {
  console.log(1);
}
```

执行阶段

```js
showName(); // 1
showName = function () {
  console.log(2);
};
showName(); // 2
```

# 调用栈：为什么 JavaScript 代码会出现栈溢出

怎么才算一段代码？

- JavaScript 执行全局代码时候，编译全局代码，创建全局的执行上下文，整个生命周期只有一个全局执行上下文
- 调用函数，函数体代码被编译，创建函数执行上下文，一般函数执行结束后，函数执行上下文被销毁
- eval 执行的是也会被编译，创建执行上下文

那么调用栈又是什么。

有时候我们会遇到 Maximum call stack size exceeded

我们经常出现一个函数调用另外一个函数的情况，调用栈就是用来管理函数调用关系的数据结构。我们需要了解什么是函数调用，什么是栈

## 什么是函数调用

比如

```js
var a = 2;
function add() {
  var b = 10;
  return a + b;
}
add();
```

一开始引擎会创建全局执行上下文，包括了函数声明和变量

![](/img/posts/browser/js/3.png)

全局的变量和全局的函数都保存在全局上下文的环境变量中

执行到 add() 判断是函数调用

- 从全局环境变量取出 add 代码函数
- 对 add 代码函数进行编译，创建函数执行上下文和可执行代码
- 执行代码，输出结果

![](/img/posts/browser/js/4.png)

我们于是有了全局上下文和函数上下文，也就是说执行代码的时候可能存在多个上下文，那引擎是怎么管理的呢？用栈，它是怎么管理的呢？

## 什么是栈

![](/img/posts/browser/js/5.png)

## 什么是 JavaScript 的调用栈

引擎正是利用栈来管理上下文，上下文创建好了以后会压入栈中，通常叫做执行上下文栈，也叫做调用栈

```js
var a = 2;
function add(b, c) {
  return b + c;
}
function addAll(b, c) {
  var d = 10;
  result = add(b, c);
  return a + result + d;
}
addAll(3, 6);
```

我们看一个比较复杂的

第一步，创建全局上下文栈

![](/img/posts/browser/js/6.png)

a add allAll 都加到了全局环境变量上，然后开始执行代码

首先 `a=2`，全局变量 a 变成了 2

![](/img/posts/browser/js/7.png)

然后调用 addAll，编译这个函数，创建一个函数上下文，最后压入栈中

![](/img/posts/browser/js/8.png)

这个时候 d 是 undefined，result 也是 undefined

然后进入了执行阶段，先 `d=10`，然后执行 add 函数，为它又创建了一个新的函数上下文，压入栈中

![](/img/posts/browser/js/9.png)

当 add 返回的时候，该函数的执行上下文会弹出栈，result 设置为 add 函数返回的值

![](/img/posts/browser/js/10.png)

addAll 执行最后的操作，返回结果，也从栈中弹出了它的函数上下文

![](/img/posts/browser/js/11.png)

最后只剩下全局的执行上下文了

所以，调用栈是 JavaScript 引擎追踪函数执行的一个机制

## 在开发中，如何利用好调用栈

### 如何利用浏览器查看调用栈的信息

调试的时候，加入断点，可以看它的调用栈，比如上面的例子：

![](/img/posts/browser/js/12.png)

调用栈最底下是匿名的，代表全局上下文，中间是 addAll，然后是 add

我们也可以通过 console.trace() 来输出调用关系，比如下图

![](/img/posts/browser/js/13.png)

### 栈溢出（Stack Overflow）

调用栈是有大小的，超过一定的数量就会报错，叫做栈溢出

写递归的时候经常会出现，如果没有终止条件，就会返回创建新的上下文压入栈中，最终超过了上限

我们可以修改递归的写法，用其他方式实现，也可以把任务拆成一小块一小块，防止一直入栈

## 总结

```js
function runStack(n) {
  if (n === 0) return 100;
  return runStack(n - 2);
}
runStack(50000);
```

上面的代码会递归了 50000 层，造成栈溢出，我们进行优化：

```js
function runStack(n) {
  while (true) {
    if (n === 0) {
      return 100;
    }

    if (n === 1) {
      // 防止陷入死循环
      return 200;
    }

    n = n - 2;
  }
}

console.log(runStack(50000));
```
