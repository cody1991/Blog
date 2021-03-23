---
layout: post
title: 《浏览器工作原理与实践》系列笔记 - V8工作原理
tags: [browser]
---

# 栈空间和堆空间：数据是如何存储的

## 让人疑惑的代码

```js
function foo() {
  var a = 1;
  var b = a;
  a = 2;
  console.log(a);
  console.log(b);
}
foo();
```

```js
function foo() {
  var a = { name: ' 极客时间 ' };
  var b = a;
  a.name = ' 极客邦 ';
  console.log(a);
  console.log(b);
}
foo();
```

执行第一段代码，打印出来 a 的值是 2，b 的值是 1

再执行第二段代码，最终 a 和 b 打印出来的值都是{name:"极客邦"}

## JavaScript 是什么类型的语言

比如 C 语言在定义变量之前，就需要确定变量的类型，你可以看下面这段 C 代码：

```c++
int main()
{
   int a = 1;
   char* b = " 极客时间 ";
   bool c = true;
   return 0;
}
```

上述代码声明变量的特点是：在声明变量之前需要先定义变量类型。我们把这种在使用之前就需要确认其变量数据类型的称为静态语言

我们把在运行过程中需要检查数据类型的语言称为动态语言。比如我们所讲的 JavaScript 就是动态语言，因为在声明变量之前并不需要确认其数据类型

虽然 C 语言是静态，但是在 C 语言中，我们可以把其他类型数据赋予给一个声明好的变量，如：

```c++
c = a
```

前面代码中，我们把 int 型的变量 a 赋值给了 bool 型的变量 c，这段代码也是可以编译执行的，因为在赋值过程中，C 编译器会把 int 型的变量悄悄转换为 bool 型的变量，我们通常把这种偷偷转换的操作称为隐式类型转换。

而支持隐式类型转换的语言称为弱类型语言，不支持隐式类型转换的语言称为强类型语言。在这点上，C 和 JavaScript 都是弱类型语言。

![](/img/posts/browser/v8/1.png)

## JavaScript 的数据类型

- 弱类型，意味着你不需要告诉 JavaScript 引擎这个或那个变量是什么数据类型，JavaScript 引擎在运行代码的时候自己会计算出来
- 动态，意味着你可以使用同一个变量保存不同类型的数据

```js
var bar;
bar = 12;
bar = ' 极客时间 ';
bar = true;
bar = null;
bar = { name: ' 极客时间 ' };
```

```js
var bar;
console.log(typeof bar); //undefined
bar = 12;
console.log(typeof bar); //number
bar = ' 极客时间 ';
console.log(typeof bar); //string
bar = true;
console.log(typeof bar); //boolean
bar = null;
console.log(typeof bar); //object
bar = { name: ' 极客时间 ' };
console.log(typeof bar); //object
```

JavaScript 中的数据类型一种有 8 种

![](/img/posts/browser/v8/2.png)

- 使用 typeof 检测 Null 类型时，返回的是 Object
- Object 类型比较特殊，它是由上述 7 种类型组成的一个包含了 key-value 对的数据类型
- 我们把前面的 7 种数据类型称为原始类型，把最后一个对象类型称为引用类型

把它们区分为两种不同的类型，是因为它们在内存中存放的位置不一样，看看 JavaScript 的原始类型和引用类型到底是怎么储存的

## 内存空间

![](/img/posts/browser/v8/3.png)

在 JavaScript 的执行过程中， 主要有三种类型内存空间，分别是代码空间、栈空间和堆空间。

## 栈空间和堆空间

这里的栈空间就是我们之前反复提及的调用栈，是用来存储执行上下文的

```js
function foo() {
  var a = ' 极客时间 ';
  var b = a;
  var c = { name: ' 极客时间 ' };
  var d = c;
}
foo();
```

执行一段代码时，需要先编译，并创建执行上下文，然后再按照顺序执行代码

当执行到第 3 行代码时，其调用栈的状态

![](/img/posts/browser/v8/4.png)

变量 a 和变量 b 的值都被保存在执行上下文中，而执行上下文又被压入到栈中，所以你也可以认为变量 a 和变量 b 的值都是存放在栈中的

执行第 4 行代码，由于 JavaScript 引擎判断右边的值是一个引用类型，这时候处理的情况就不一样了，JavaScript 引擎并不是直接将该对象存放到变量环境中，而是将它分配到堆空间里面，分配后该对象会有一个在“堆”中的地址，然后再将该数据的地址写进 c 的变量值，最终分配好内存的示意图如下所示

![](/img/posts/browser/v8/5.png)

对象类型是存放在堆空间的，在栈空间中只是保留了对象的引用地址，当 JavaScript 需要访问该数据的时候，是通过栈中的引用地址来访问的，相当于多了一道转手流程

所以，**原始类型的数据值都是直接保存在“栈”中的，引用类型的值是存放在“堆”中的**

为什么一定要分“堆”和“栈”两个存储空间呢？所有数据直接存放在“栈”中不就可以了吗？

这是因为 JavaScript 引擎需要用栈来维护程序执行期间上下文的状态，如果栈空间大了话，所有的数据都存放在栈空间里面，那么会影响到上下文切换的效率，进而又影响到整个程序的执行效率

比如文中的 foo 函数执行结束了，JavaScript 引擎需要离开当前的执行上下文，只需要将指针下移到上个执行上下文的地址就可以了

![](/img/posts/browser/v8/6.png)

通常情况下，栈空间都不会设置太大，主要用来存放一些原始类型的小数据。而引用类型的数据占用的空间都比较大，所以这一类数据会被存放到堆中，堆空间很大，能存放很多大的数据，不过缺点是分配内存和回收内存都会占用一定的时间

看看它最后一步将变量 c 赋值给变量 d 是怎么执行的？

赋值操作和其他语言有很大的不同，原始类型的赋值会完整复制变量值，而引用类型的赋值是复制引用地址

所以 d=c 的操作就是把 c 的引用地址赋值给 d

![](/img/posts/browser/v8/7.png)

变量 c 和变量 d 都指向了同一个堆中的对象，所以这就很好地解释了文章开头的那个问题，通过 c 修改 name 的值，变量 d 的值也跟着改变，归根结底它们是同一个对象

## 再谈闭包

你知道了作用域内的原始类型数据会被存储到栈空间，引用类型会被存储到堆空间，基于这两点的认知，我们再深入一步，探讨下闭包的内存模型

```js
function foo() {
  var myName = ' 极客时间 ';
  let test1 = 1;
  const test2 = 2;
  var innerBar = {
    setName: function (newName) {
      myName = newName;
    },
    getName: function () {
      console.log(test1);
      return myName;
    },
  };
  return innerBar;
}
var bar = foo();
bar.setName(' 极客邦 ');
bar.getName();
console.log(bar.getName());
```

- 当 JavaScript 引擎执行到 foo 函数时，首先会编译，并创建一个空执行上下文
- 在编译过程中，遇到内部函数 setName，JavaScript 引擎还要对内部函数做一次快速的词法扫描，发现该内部函数引用了 foo - 函数中的 myName 变量，由于是内部函数引用了外部函数的变量，所以 JavaScript 引擎判断这是一个闭包，于是在堆空间创建换一个“closure(foo)”的对象（这是一个内部对象，JavaScript 是无法访问的），用来保存 myName 变量。
- 接着继续扫描到 getName 方法时，发现该函数内部还引用变量 test1，于是 JavaScript 引擎又将 test1 添加到“closure(foo)”对象中。这时候堆中的“closure(foo)”对象中就包含了 myName 和 test1 两个变量了。
- 由于 test2 并没有被内部函数引用，所以 test2 依然保存在调用栈中

画出执行到 foo 函数中“return innerBar”语句时的调用栈状态

![](/img/posts/browser/v8/8.png)

当执行到 foo 函数时，闭包就产生了

当 foo 函数执行结束之后，返回的 getName 和 setName 方法都引用“clourse(foo)”对象，所以即使 foo 函数退出了，“clourse(foo)”依然被其内部的 getName 和 setName 方法引用。所以在下次调用 bar.setName 或者 bar.getName 时，创建的执行上下文中就包含了“clourse(foo)”。

innerBar 返回后，含有 setName 和 getName 对象，这两个对象里面包含了堆中的 closure(foo)的引用。虽然 foo 执行上下文销毁了，foo 函数中的对 closure(foo)的引用也断开了，但是 setName 和 getName 里面又重新建立起来了对 closure(foo)引用。

产生闭包的核心有两步：

1. 第一步是需要预扫描内部函数
2. 第二步是把内部函数引用的外部变量保存到堆中
