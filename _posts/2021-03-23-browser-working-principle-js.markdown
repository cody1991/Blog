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

# 块级作用域：var 缺陷以及为什么要引入 let 和 const

## 作用域

作用域是变量和函数可访问的范围，即作用域控制函数和变量的生命周期和可见性

ES6 之前只有全局作用域和函数作用域

- 全局作用域，在任何地方都可以访问，跟随页面的生命周期
- 函数作用域，函数内部特定的函数和变量，只能在函数内部访问，执行结束以后被销毁

很多其他语言支持 块级作用域，比如 函数、判断语句、循环语句 里面的

```js
//if块
if (1) {
}

//while块
while (1) {}

//函数块
function foo() {}

//for循环块
for (let i = 0; i < 100; i++) {}

//单独一个块
{
}
```

块级作用域定义的变量在外部是访问不到的，执行完以后也会销毁

JavaScript 没有了块级作用域，再把作用域内部的变量统一提升无疑是最快速、最简单的设计

不过这也直接导致了函数中的变量无论是在哪里声明的，在编译阶段都会被提取到执行上下文的变量环境中

所以这些变量在整个函数体内部的任何地方都是能被访问的，这也就是 JavaScript 中的变量提升

## 变量提升所带来的问题

### 变量容易在不被察觉的情况下被覆盖掉

```js
var myname = '🐱';
function showName() {
  console.log(myname);
  if (0) {
    var myname = '🐶';
  }
  console.log(myname);
}
showName();
```

打印 undefined，也很容易理解，由于变量提升，当前的执行上下文中就包含了变量 myname，而值是 undefined，所以获取到的 myname 的值就是 undefined。

![](/img/posts/browser/js/14.png)

### 本应销毁的变量没有被销毁

```js
function foo() {
  for (var i = 0; i < 7; i++) {}
  console.log(i);
}
foo();
```

这里 i 输出 7，如果是有快作用域的话，应该循环结束就没有 i 这个变量了，会被销毁

在创建执行上下文阶段，变量 i 就已经被提升了，所以当 for 循环结束之后，变量 i 并没有被销毁。

## ES6 是如何解决变量提升带来的缺陷

ES6 引入了 let 和 const 关键字，从而使 JavaScript 也能像其他语言一样拥有了块级作用域

```js
function letTest() {
  let x = 1;
  if (true) {
    let x = 2; // 不同的变量
    console.log(x); // 2
  }
  console.log(x); // 1
}
```

let 关键字是支持块级作用域的，所以在编译阶段，JavaScript 引擎并不会把 if 块中通过 let 声明的变量存放到变量环境中

这也就意味着在 if 块通过 let 声明的关键字，并不会提升到全函数可见

所以在 if 块之内打印出来的值是 2，跳出语块之后，打印出来的值就是 1 了

这种就非常符合我们的编程习惯了：作用块内声明的变量不影响块外面的变量

## JavaScript 是如何支持块级作用域的

ES6 是如何做到既要支持变量提升的特性，又要支持块级作用域的呢

站在执行上下文的角度来揭开答案

JavaScript 引擎是通过变量环境实现函数级作用域的，那么 ES6 又是如何在函数级作用域的基础之上，实现对块级作用域的支持呢

```js
function foo() {
  var a = 1;
  let b = 2;
  {
    let b = 3;
    var c = 4;
    let d = 5;
    console.log(a);
    console.log(b);
  }
  console.log(b);
  console.log(c);
  console.log(d);
}
foo();
```

我们引入了 let 关键字，let 关键字会创建块级作用域，那么 let 关键字是如何影响执行上下文的呢

第一步是编译并创建执行上下文

![](/img/posts/browser/js/15.png)

- var 定义的在编译阶段全都被存放到变量环境里面
- let 声明的变量在编译阶段会被存放到词法环境（Lexical Environment）中
- 函数的块级作用域内部，通过 let 声明的变量并没有被存放到词法环境中
- 接下来执行代码，a 设置为 1，词法环境的 b 设置为 2

变成了如下图

![](/img/posts/browser/js/16.png)

进入函数的作用域块时，作用域块中通过 let 声明的变量，会被存放在词法环境的一个单独的区域中，这个区域中的变量并不影响作用域块外面的变量，比如在作用域外面声明了变量 b，在该作用域块内部也声明了变量 b，当执行到作用域内部时，它们都是独立的存在

在词法环境内部，维护了一个小型栈结构，栈底是函数最外层的变量，进入一个作用域块后，就会把该作用域块内部的变量压到栈顶；当作用域执行完成之后，该作用域的信息就会从栈顶弹出，这就是词法环境的结构。这里所讲的变量是指通过 let 或者 const 声明的变量

当执行到作用域块中的 console.log(a)这行代码时，就需要在词法环境和变量环境中查找变量 a 的值了，具体查找方式是：沿着词法环境的栈顶向下查询，如果在词法环境中的某个块中查找到了，就直接返回给 JavaScript 引擎，如果没有查找到，那么继续在变量环境中查找

![](/img/posts/browser/js/17.png)

要完整理解查找变量或者查找函数的流程，就涉及到作用域链了，这个后面做详细介绍

当作用域块执行结束之后，其内部定义的变量就会从词法环境的栈顶弹出，最终执行上下文如下图

![](/img/posts/browser/js/18.png)

块级作用域就是通过词法环境的栈结构来实现的，而变量提升是通过变量环境来实现，通过这两者的结合，JavaScript 引擎也就同时支持了变量提升和块级作用域了

## 总结

由于 JavaScript 的变量提升存在着变量覆盖、变量污染等设计缺陷，所以 ES6 引入了块级作用域关键字来解决这些问题

过对变量环境和词法环境的介绍，分析了 JavaScript 引擎是如何同时支持变量提升和块级作用域的

语言本身好坏不重要，重要的是能为开发者创造价值

# 作用域链和闭包：代码中出现相同的变量，JavaScript 引擎如何选择

理解作用域链是理解闭包的基础，而闭包在 JavaScript 中几乎无处不在，同时作用域和作用域链还是所有编程语言的基础。所以，如果你想学透一门语言，作用域和作用域链一定是绕不开的

```js
function bar() {
  console.log(myName);
}
function foo() {
  var myName = ' 🐱 ';
  bar();
}
var myName = ' 🐶 ';
foo();
```

我们看下它的调用栈

![](/img/posts/browser/js/19.png)

- 先查找栈顶是否存在 myName 变量，但是这里没有，所以接着往下查找 foo 函数中的变量。
- 在 foo 函数中查找到了 myName 变量，这时候就使用 foo 函数中的 myName。

但实际情况并非如此，如果你试着执行上述代码，你会发现打印出来的结果是全局的变量 myName

## 作用域链

每个执行上下文的变量环境中，都包含了一个外部引用，用来指向外部的执行上下文，我们把这个外部引用称为 outer

当一段代码使用了一个变量时，JavaScript 引擎首先会在“当前的执行上下文”中查找该变量， 比如上面那段代码在查找 myName 变量时，如果在当前的变量环境中没有查找到，那么 JavaScript 引擎会继续在 outer 所指向的执行上下文中查找

![](/img/posts/browser/js/20.png)

bar 函数和 foo 函数的 outer 都是指向全局上下文的，这也就意味着如果在 bar 函数或者 foo 函数中使用了外部变量，那么 JavaScript 引擎会去全局执行上下文中查找。我们把这个查找的链条就称为作用域链

还有一个疑问没有解开，foo 函数调用的 bar 函数，那为什么 bar 函数的外部引用是全局执行上下文，而不是 foo 函数的执行上下文?

需要知道什么是词法作用域。这是因为在 JavaScript 执行过程中，其作用域链是由词法作用域决定的

## 词法作用域

词法作用域就是指作用域是由代码中函数声明的位置来决定的，所以词法作用域是静态的作用域，通过它就能够预测代码在执行过程中如何查找标识符

![](/img/posts/browser/js/21.png)

词法作用域就是根据代码的位置来决定的，其中 main 函数包含了 bar 函数，bar 函数中包含了 foo 函数，因为 JavaScript 作用域链是由词法作用域决定的，所以整个词法作用域链的顺序是：foo 函数作用域—>bar 函数作用域—>main 函数作用域—> 全局作用域

词法作用域以及 JavaScript 中的作用域链，我们再回过头来看看上面的那个问题：在开头那段代码中，foo 函数调用了 bar 函数，那为什么 bar 函数的外部引用是全局执行上下文，而不是 foo 函数的执行上下文?

为根据词法作用域，foo 和 bar 的上级作用域都是全局作用域，所以如果 foo 或者 bar 函数使用了一个它们没有定义的变量，那么它们会到全局作用域去查找

**词法作用域是代码阶段就决定好的，和函数是怎么调用的没有关系**

## 块级作用域中的变量查找

```js
function bar() {
  var myName = ' 🐱 ';
  let test1 = 100;
  if (1) {
    let myName = ' 🐑 ';
    console.log(test);
  }
}
function foo() {
  var myName = ' 🐶 ';
  let test = 2;
  {
    let test = 3;
    bar();
  }
}
var myName = ' 🐷 ';
let myAge = 10;
let test = 1;
foo();
```

ES6 是支持块级作用域的，当执行到代码块时，如果代码块中有 let 或者 const 声明的变量，那么变量就会存放到该函数的词法环境中

对于上面这段代码，当执行到 bar 函数内部的 if 语句块时，其调用栈的情况如下图所示：

![](/img/posts/browser/js/22.png)

是执行到 bar 函数的 if 语块之内，需要打印出来变量 test，那么就需要查找到 test 变量的值，其查找过程我已经在上图中使用序号 1、2、3、4、5 标记出来了

首先是在 bar 函数的执行上下文中查找，但因为 bar 函数的执行上下文中没有定义 test 变量，所以根据词法作用域的规则，下一步就在 bar 函数的外部作用域中查找，也就是全局作用域

## 闭包

```js
function foo() {
  var myName = ' 🐶 ';
  let test1 = 1;
  const test2 = 2;
  var innerBar = {
    getName: function () {
      console.log(test1);
      return myName;
    },
    setName: function (newName) {
      myName = newName;
    },
  };
  return innerBar;
}
var bar = foo();
bar.setName(' 🐱 ');
bar.getName();
console.log(bar.getName());
```

![](/img/posts/browser/js/23.png)

innerBar 是一个对象，包含了 getName 和 setName 的两个方法（通常我们把对象内部的函数称为方法）

这两个方法都是在 foo 函数内部定义的，并且这两个方法内部都使用了 myName 和 test1 两个变量

根据词法作用域的规则，内部函数 getName 和 setName 总是可以访问它们的外部函数 foo 中的变量

当 innerBar 对象返回给全局变量 bar 时，虽然 foo 函数已经执行结束，但是 getName 和 setName 函数依然可以使用 foo 函数中的变量 myName 和 test1

所以当 foo 函数执行完成之后，其整个调用栈的状态如下图

![](/img/posts/browser/js/24.png)

foo 函数执行完成之后，其执行上下文从栈顶弹出了，但是由于返回的 setName 和 getName 方法中使用了 foo 函数内部的变量 myName 和 test1，所以这两个变量依然保存在内存中

这像极了 setName 和 getName 方法背的一个专属背包，无论在哪里调用了 setName 和 getName 方法，它们都会背着这个 foo 函数的专属背包

除了 setName 和 getName 函数之外，其他任何地方都是无法访问该背包的，我们就可以把这个背包称为 foo 函数的闭包

**在 JavaScript 中，根据词法作用域的规则，内部函数总是可以访问其外部函数中声明的变量，当通过调用一个外部函数返回一个内部函数后，即使该外部函数已经执行结束了，但是内部函数引用外部函数的变量依然保存在内存中，我们就把这些变量的集合称为闭包**

比如外部函数是 foo，那么这些变量的集合就称为 foo 函数的闭包

当执行到 bar.setName 方法中的 myName = "极客邦"这句代码时，JavaScript 引擎会沿着“当前执行上下文–>foo 函数闭包–> 全局执行上下文”的顺序来查找 myName 变量

![](/img/posts/browser/js/25.png)

setName 的执行上下文中没有 myName 变量，foo 函数的闭包中包含了变量 myName，所以调用 setName 时，会修改 foo 闭包中的 myName 变量的值

当调用 bar.getName 的时候，所访问的变量 myName 也是位于 foo 函数闭包中的

![](/img/posts/browser/js/26.png)

当调用 bar.getName 的时候，右边 Scope 项就体现出了作用域链的情况：Local 就是当前的 getName 函数的作用域，Closure(foo) 是指 foo 函数的闭包，最下面的 Global 就是指全局作用域，从“Local–>Closure(foo)–>Global”就是一个完整的作用域链

通过 Scope 来查看实际代码作用域链的情况，这样调试代码也会比较方便

## 闭包是怎么回收的

如果引用闭包的函数是一个全局变量，那么闭包会一直存在直到页面关闭；但如果这个闭包以后不再使用的话，就会造成内存泄漏

如果引用闭包的函数是个局部变量，等函数销毁后，在下次 JavaScript 引擎执行垃圾回收时，判断闭包这块内容如果已经不再被使用了，那么 JavaScript 引擎的垃圾回收器就会回收这块内存

使用闭包的时候，你要尽量注意一个原则：如果该闭包会一直使用，那么它可以作为全局变量而存在；但如果使用频率不高，而且占用内存又比较大的话，那就尽量让它成为一个局部变量

## 总结

- 介绍了什么是作用域链，我们把通过作用域查找变量的链条称为作用域链；作用域链是通过词法作用域来确定的，而词法作用域反映了代码的结构
- 介绍了在块级作用域中是如何通过作用域链来查找变量的
- 基于作用域链和词法环境介绍了到底什么是闭包

# this：从 JavaScript 执行上下文视角讲 this

## JavaScript 中的 this 是什么

执行上下文中包含了变量环境、词法环境、外部环境，但其实还有一个 this 没有提及

![](/img/posts/browser/js/27.png)

this 是和执行上下文绑定的，也就是说每个执行上下文中都有一个 this

执行上下文主要分为三种——全局执行上下文、函数执行上下文和 eval 执行上下文，所以对应的 this 也只有这三种——全局执行上下文中的 this、函数中的 this 和 eval 中的 this

## 全局执行上下文中的 this

控制台中输入 console.log(this)来打印出来全局执行上下文中的 this，最终输出的是 window 对象

所以你可以得出这样一个结论：全局执行上下文中的 this 是指向 window 对象的

这也是 this 和作用域链的唯一交点，作用域链的最底端包含了 window 对象，全局执行上下文中的 this 也是指向 window 对象

## 函数执行上下文中的 this

```js
function foo() {
  console.log(this);
}
foo();
```

打印出来的也是 window 对象，这说明在默认情况下调用一个函数，其执行上下文中的 this 也是指向 window 对象的

那能不能设置执行上下文中的 this 来指向其他对象呢？答案是肯定的。通常情况下，有下面三种方式来设置函数执行上下文中的 this 值

### 通过函数的 call 方法设置

通过函数的 call 方法来设置函数执行上下文的 this 指向，比如下面这段代码，我们就并没有直接调用 foo 函数，而是调用了 foo 的 call 方法，并将 bar 对象作为 call 方法的参数

```js
let bar = {
  myName: ' 极客邦 ',
  test1: 1,
};
function foo() {
  this.myName = ' 极客时间 ';
}
foo.call(bar);
console.log(bar);
console.log(myName);
```

发现 foo 函数内部的 this 已经指向了 bar 对象，因为通过打印 bar 对象，可以看出 bar 的 myName 属性已经由“极客邦”变为“极客时间”了，同时在全局执行上下文中打印 myName，JavaScript 引擎提示该变量未定义

还可以使用 bind 和 apply 方法来设置函数执行上下文中的 this

### 通过对象调用方法设置

可以通过对象调用的方式

```js
var myObj = {
  name: ' 极客时间 ',
  showThis: function () {
    console.log(this);
  },
};
myObj.showThis();
```

使用对象来调用其内部的一个方法，该方法的 this 是指向对象本身的

也可以认为 JavaScript 引擎在执行 myObject.showThis()时，将其转化为了：

```js
myObj.showThis.call(myObj);
```

接下来我们稍微改变下调用方式，把 showThis 赋给一个全局对象，然后再调用该对象，代码如下所示：

```js
var myObj = {
  name: ' 极客时间 ',
  showThis: function () {
    this.name = ' 极客邦 ';
    console.log(this);
  },
};

var foo = myObj.showThis();
foo();
```

执行这段代码，你会发现 this 又指向了全局 window 对象

所以通过以上两个例子的对比，你可以得出下面这样两个结论：

- 在全局环境中调用一个函数，函数内部的 this 指向的是全局变量 window。
- 通过一个对象来调用其内部的一个方法，该方法的执行上下文中的 this 指向对象本身

## 通过构造函数中设置

```js
function CreateObj() {
  this.name = ' 极客时间 ';
}
var myObj = new CreateObj();
```

当执行 new CreateObj() 的时候，JavaScript 引擎做了如下四件事

- 创建了一个空对象 tempObj
- 调用 CreateObj.call 方法，并将 tempObj 作为 call 方法的参数，这样当 CreateObj 的执行上下文创建时，它的 this 就指向了 tempObj 对象
- 执行 CreateObj 函数，此时的 CreateObj 函数执行上下文中的 this 指向了 tempObj 对象
- 返回 tempObj 对象

```js
var tempObj = {};
CreateObj.call(tempObj);
return tempObj;
```

通过 new 关键字构建好了一个新对象，并且构造函数中的 this 其实就是新对象本身

## this 的设计缺陷以及应对方案

### 嵌套函数中的 this 不会从外层函数中继承

```js
var myObj = {
  name: ' 极客时间 ',
  showThis: function () {
    console.log(this);
    function bar() {
      console.log(this);
    }
    bar();
  },
};
myObj.showThis();
```

bar 函数中的 this 是什么?

执行这段代码后，你会发现函数 bar 中的 this 指向的是全局 window 对象，而函数 showThis 中的 this 指向的是 myObj 对象

声明一个变量 self 用来保存 this，然后在 bar 函数中使用 self

```js
var myObj = {
  name: ' 极客时间 ',
  showThis: function () {
    console.log(this);
    var self = this;
    function bar() {
      self.name = ' 极客邦 ';
    }
    bar();
  },
};
myObj.showThis();
console.log(myObj.name);
console.log(window.name);
```

这个方法的的本质是把 this 体系转换为了作用域的体系

也可以使用 ES6 中的箭头函数来解决这个问题

```js
var myObj = {
  name: ' 极客时间 ',
  showThis: function () {
    console.log(this);
    var bar = () => {
      this.name = ' 极客邦 ';
      console.log(this);
    };
    bar();
  },
};
myObj.showThis();
console.log(myObj.name);
console.log(window.name);
```

箭头函数 bar 里面的 this 是指向 myObj 对象的

因为 ES6 中的箭头函数并不会创建其自身的执行上下文，所以箭头函数中的 this 取决于它的外部函数

### 普通函数中的 this 默认指向全局对象 window

在默认情况下调用一个函数，其执行上下文中的 this 是默认指向全局对象 window 的

在实际工作中，我们并不希望函数执行上下文中的 this 默认指向全局对象，因为这样会打破数据的边界，造成一些误操作

如果要让函数执行上下文中的 this 指向某个对象，最好的方式是通过 call 方法来显示调用

以通过设置 JavaScript 的“严格模式”来解决。在严格模式下，默认执行一个函数，其函数的执行上下文中的 this 值是 undefined，这就解决上面的问题了

## 总结

- 当函数作为对象的方法调用时，函数中的 this 就是该对象
- 当函数被正常调用时，在严格模式下，this 值是 undefined，非严格模式下 this 指向的是全局对象 window
- 嵌套函数中的 this 不会继承外层函数的 this 值
- 箭头函数没有自己的执行上下文，所以箭头函数的 this 就是它外层函数的 this
