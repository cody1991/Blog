---
layout: post
title: 《浏览器工作原理与实践》系列笔记 - 循环系统
tags: [browser]
---

# 消息队列和事件循环：页面是怎么活起来的

每个渲染进程都有一个主线程，主线程非常繁忙，要处理 DOM，要计算样式，处理布局，处理 js 的任务，以及各种输入事件。那么多不同类型的任务是如何在主线程上有条不紊进行的？这就需要一个系统来统筹这些任务，这个统筹系统就是今天要讲的消息队列和循环系统

我们从简单的场景分析，一步步了解浏览器主线程是如何运行的

## 使用单线程处理安排好的任务

我们从简单的场景说起，比如有下面这一系列的任务

- 任务 1：`1+2`
- 任务 2：`20/5`
- 任务 3：`7*8`
- 任务 4：打印出任务 1、任务 2、任务 3 的运算结果

写出下面的代码

```c++
void MainThread()
{
	int	num1	= 1 + 2;                        /* 任务 1 */
	int	num2	= 20 / 5;                       /* 任务 2 */
	int	num3	= 7 * 8;                        /* 任务 3 */
	print( "最终计算的值为:%d,%d,%d", num, num2, num3 );   /* 任务 4 */
}
```

上面的代码，我们会把任务按照顺序写到主进程。线程执行时，任务按顺序被依次执行，所有任务都执行完成以后，线程自动退出

![](/img/posts/browser/loop/1.png)

## 在线程运行过程中处理新任务

不是所有任务在线程执行前都准备好了，大部分是线程运行的时候产生的，比如上面的代码中，又临时插入了一个计算，上面的代码无法处理

要想在线程执行过程中执行新的任务，就需要采用时间循环机制

```c++
/*
 * GetInput
 * 等待用户从键盘输入一个数字，并返回该输入的数字
 */
int GetInput()
{
	int input_number = 0;
	cout << " 请输入一个数:";
	cin >> input_number;
	return(input_number);
}


/* 主线程 (Main Thread) */
void MainThread()
{
	for (;;)
	{
		int	first_num	= GetInput();
		int	second_num	= GetInput();
		result_num = first_num + second_num;
		print( "最终计算的值为:%d", result_num );
	}
}
```

这一版做了下面的改进

- 引入了循环的机制，添加一个 for 循环
- 引入了事件，可以在运行过程中等待用户的输入，等待过程处于暂停状态，一旦收到用户的输入信息，线程会被激活，进行运输，输出结果

通过事件循环机制，整个程序活起来了，我们每输入两个数字就会打印出对应的结果

![](/img/posts/browser/loop/2.png)

## 处理其他线程发送过来的任务

上面引进了事件循环，可以在执行过程中加入新任务。不过任务都来自线程自己内部的，如果另外一个线程想要主线程去完成一些任务，就无法实现了

我们看看其他线程是怎么给主线程发消息的

![](/img/posts/browser/loop/3.png)

可以看到渲染主线程会频繁接收来自 IO 线程的任务，收到这些任务以后（资源加载完成事件，鼠标点击事件，其他事件），主线程就要开始去处理它们。比如接收到资源加载完成以后主线程开始解析 DOM，接收到鼠标点击事件，开始执行 js 代码中处理该点击的事件

如何设计好一个模型，来接受其他线程发送的消息呢？

一个通用的模式是使用消息队列，我们先看看什么是队列

![](/img/posts/browser/loop/4.png)

它是一个数据结构，存放要执行的任务，符合先进先出的特点，新添加的任务放在队尾，要执行的任务在队头取出

我们现在的线程模型变成了下面这样

![](/img/posts/browser/loop/5.png)

- 添加了一个消息队列
- IO 线程产生的新任务放在消息队列的尾部
- 渲染主线程会循环从消息队列头取任务去执行

于是乎我们先创建一个队列

```c++
class TaskQueue {
  public:
	Task takeTask();                /* 取出队列头部的一个任务 */
	void pushTask( Task task );     /* 添加一个任务到队列尾部 */
};
```

改造主线程

```c++
TaskQueue task_queue ;
void ProcessTask();
void MainThread()
{
	for (;; )
	{
		Task task = task_queue.takeTask();
		ProcessTask( task );
	}
}
```

我们创建了一个队列，然后在 for 循环里面读取一个任务，执行这个任务，主线程一直这样循环下去，主要消息队列中有任务，就会去执行

现在主线程所有任务都从消息队列中获取，其他线程想要主线程执行任务，把任务驾到消息队列中就好了

```c++
Task clickTask;
task_queue.pushTask(clickTask)
```

## 处理其他进程发送过来的任务

使用消息队列，我们实现了线程之间的通信。在浏览器中跨进程的任务也经常发生，如何处理其他进程的任务呢？

![](/img/posts/browser/loop/6.png)

渲染进程专门有一个 IO 线程接受其他进程的消息，会把消息组装成任务发给渲染主线程，后续的步骤和处理其他线程的任务一样了

## 消息队列中的任务类型

- 有输入事件，比如鼠标滚动，点击，移动
- 微任务
- 文件读写
- websocket
- 定时器
- 页面相关的，如 js 执行，解析 DOM，样式计算，布局计算

以上都是在主线程执行的，所以我们需要衡量这些事件的时长，想办法解决占用时长长的任务

## 如何安全退出

如果页面主线程执行完毕，如何保证主进程的安全退出？

Chrome 在确认退出当前页面的时候，会设置一个标示退出的变量，每执行完一个任务，看看有没有设置退出标示

如果设置了，直接中断现在所有的任务，退出线程

```c++
TaskQueue task_queue ；
void ProcessTask();

bool keep_running = true;
void MainThread()
{
	for (;; )
	{
		Task task = task_queue.takeTask();
		ProcessTask( task );
		if ( !keep_running ) /* 如果设置了退出标志，那么直接退出线程循环 */
			break;
	}
}
```

## 页面使用单线程的缺点

### 如何处理高优先级的任务？

比如一个典型的场景是监控 DOM 的变化（插入，删除，修改），根据变化来处理业务逻辑。

通用的做法是监听接口，发生变化的时候调用接口，典型的观察者模式

不过 DOM 频繁变化，如果都直接调用对应的接口，这个任务的执行时间会很长，导致浏览器执行效率的下降

如果把这些 DOM 变化当成异步处理的话，添加到了消息队列尾部，影响了实时性，因为这个时候可能前面排着很多的任务

也就是说监听 DOM 的变化，同步的方式会使渲染主线程的效率下降，采用异步的方法会造成实时性不高的问题

于是微任务产生了，看下微任务是如何权衡效率和实时性的

我们一般把消息队列的任务叫做宏任务，每个宏任务包括了一个微任务列表。在执行宏任务的时候如果 DOM 变化了，变化会放到微任务列表中，不影响宏任务的继续执行，解决了执行效率的问题

等宏任务的事情完成了，渲染引擎不急着处理下一个宏任务，而是把当前宏任务中的微任务执行完毕，这样也解决了实时性的问题

### 如何解决单个任务执行时长过久的问题

所以任务都在单线程上执行，一次只能执行一个任务，其他任务处于等待状态，如果一个任务执行了很久，下一个以及后面的任务也会等待很长的时间

![](/img/posts/browser/loop/7.png)

比如上图 js 执行了很久，js 可以通过回调的方式规避这种情况，

## 实践：浏览器页面是如何运行的

我们可以通过开发者工具点击 Performance 标签，选择左上角的 start porfiling and load page 来记录整个页面加载过程中的事件执行情况

![](/img/posts/browser/loop/8.png)

可以看到主线程执行中的所有任务，灰色的就是一个个任务，每个任务下面有子任务。 Parse HTML 任务是把 HTML 解析为 DOM，如果解析过程中遇到了 js，暂停现在的解析，去执行 js

## 总结

- 如果有一些确定好的任务，单线程按顺序执行这些任务，第一版线程模型
- 线程执行过程中接收新的任务，引入了事件循环系统，这是第二版
- 如果要接收其他线程发过来的任务，引入了消息队列，这是第三版
- 其他进程要发任务给页面主线程，通过 IPC 把任务发给渲染进程的 IO 线程，IO 线程再把它发给页面的主线程
- 消息队列不是太灵活，为了效率和时效性，引入了微任务

# Webapi：setTimeout 是怎么实现的

定时器，指定多久后执行某个函数，返回一个整数，标示定时器的编号，可以通过它来取消定时器

```js
function showName() {
  console.log(' 🐱 ');
}
var timerID = setTimeout(showName, 200);
```

我们来看下浏览器是如何实现定时器的

## 浏览器怎么实现 setTimeout

我们知道所有运行在渲染进程主线程上的任务都先要放到消息队列中，事件循环系统按照顺序执行消息队列中的任务。

- 接收到 HTML 文档数据，渲染引擎会把解析 HTML 事件添加到消息队列
- 用户改变 web 窗口大小，渲染引擎把重新布局事件添加到消息队列
- 用户触发了 js 垃圾回收机制，渲染引擎把垃圾回收事件添加到消息队列
- 需要执行一段异步 js 代码，也需要把执行的任务放到消息队列

以上只是一部分事件，添加到消息队列以后，就会按照消息队列里面的顺序来执行

所以要执行一个异步任务，就先要放到消息队列中。不过设置定时器回调函数有点特别，需要在指定的时间间隔内被调用，但是消息队列是按照顺序来调用的，所以为了保证回调函数能在正确的时间内执行，不能直接放到消息队列中

Chrome 中还有另外一个消息队列，维护了需要延迟执行的任务队列，包括定时器和浏览器内部需要定时执行的任务。所以 js 创建一个定时器时，渲染引擎会把它驾到延迟队列中

延迟队列定义如下：

```c++
DelayedIncomingQueue delayed_incoming_queue;
```

通过 js 调用 setTimeout 设置回调函数的时候，渲染引擎创建一个回调任务，包含了回调函数的名字，当前发起的时间，延迟执行的时间，如下代码：

```c++
struct DelayTask{
  int64 id；
  CallBackFunction cbf;
  int start_time;
  int delay_time;
};
DelayTask timerTask;
timerTask.cbf = showName;
timerTask.start_time = getCurrentTime(); // 获取当前时间
timerTask.delay_time = 200;// 设置延迟执行时间
```

再把它添加到延迟队列中

```c++
delayed_incoming_queue.push(timerTask)；
```

通过定时器发起的任务就放到了延迟队列中。再看看循环系统是怎么触发延迟队列的

```c++
void ProcessTimerTask(){
  // 从 delayed_incoming_queue 中取出已经到期的定时器任务
  // 依次执行这些任务
}

TaskQueue task_queue；
void ProcessTask();
bool keep_running = true;
void MainTherad(){
  for(;;){
    // 执行消息队列中的任务
    Task task = task_queue.takeTask();
    ProcessTask(task);

    // 执行延迟队列中的任务
    ProcessDelayTask()

    if(!keep_running) // 如果设置了退出标志，那么直接退出线程循环
        break;
  }
}
```

添加了一个 ProcessDelayTask 函数，专门处理延迟队列中的任务。我们重点关注它的执行时机。处理完消息队列中的一个任务后，开始执行 ProcessDelayTask，等到期的任务完成后，开始下一次循环。通过这样的方式，一个完整的定时器就实现了。

设置一个定时器，会返回定时器 ID，还没执行的也是可以取消的，使用 clearTimeout 方法，传入定时器

```js
clearTimeout(timer_id);
```

浏览器就是从延迟列表 delayed_incoming_queue 找到对应的 ID，移除出去就好了

## 使用 setTimeout 的一些注意事项

### 如果当前任务执行时间过久，会影延迟到期定时器任务的执行

有很多因素会导致回调函数比预期的时间晚执行，其中一个原因就是当前执行的任务时间太久，导致定时任务的回调函数晚执行了

比如

```js
function bar() {
  console.log('bar');
}
function foo() {
  setTimeout(bar, 0);
  for (let i = 0; i < 5000; i++) {
    let i = 5 + 8 + 8 + 8;
    console.log(i);
  }
}
foo();
```

设置了一个 0 延时的回调任务，放入了延迟队列等待下次执行。要执行消息队列中的下个任务，要等当前任务完成。由于执行 5000 次 for 循环，执行时间比较久，肯定会影响下次的执行时间

![](/img/posts/browser/loop/9.png)

foo 执行了 500ms，setTimeout 的任务也被延时到了 500ms 以后才执行，即使它设置了 0

### 如果 setTimeout 存在嵌套调用，那么系统会设置最短时间间隔为 4 毫秒

定时器如果里面又嵌套了定时器，也会延长定时器的执行时间

```js
function cb() {
  setTimeout(cb, 0);
}
setTimeout(cb, 0);
```

![](/img/posts/browser/loop/10.png)

前面几次的间隔比较小，超过五次以后，每次调用的最小间隔是 4ms，是因为 chrome 在嵌套调用 5 次以后判断函数方法被阻塞了，如果定时器的时间小于 4ms，则定位 4ms

```c++
static const int kMaxTimerNestingLevel = 5;

// Chromium uses a minimum timer interval of 4ms. We'd like to go
// lower; however, there are poorly coded websites out there which do
// create CPU-spinning loops.  Using 4ms prevents the CPU from
// spinning too busily and provides a balance between CPU spinning and
// the smallest possible interval timer.
static constexpr base::TimeDelta kMinimumInterval = base::TimeDelta::FromMilliseconds(4);

base::TimeDelta interval_milliseconds =
      std::max(base::TimeDelta::FromMilliseconds(1), interval);

if (interval_milliseconds < kMinimumInterval && nesting_level_ >= kMaxTimerNestingLevel)
  interval_milliseconds = kMinimumInterval;

if (single_shot)
  StartOneShot(interval_milliseconds, FROM_HERE);
else
  StartRepeating(interval_milliseconds, FROM_HERE);
```

一些性能高的需求不适合使用它，setTimeout 去执行动画效果就不太适合

### 未激活的页面，setTimeout 执行最小间隔是 1000 毫秒

除了 4ms 延时，未被激活的页面定时器最小为 1000ms，为了减少后台的加载损耗和低耗电量

### 延时执行时间有最大值

Chrome、Safari、Firefox 都是以 32 个 bit 来存储延时值的，32bit 最大只能存放的数字是 2147483647 毫秒

这就意味着，如果 setTimeout 设置的延迟值大于 2147483647 毫秒（大约 24.8 天）时就会溢出，这导致定时器会被立即执行

```js
function showName() {
  console.log(' 🐱 ');
}
var timerID = setTimeout(showName, 2147483648); // 会被立刻调用执行
```

### 使用 setTimeout 设置的回调函数中的 this 不符合直觉

如果推迟执行的是某个对象的函数，该方法中的 this 指向了全局对象，而不是定义时候的对象

```js
var name = 1;
var myObj = {
  name: 2,
  showName: function () {
    console.log(this.name);
  },
};
setTimeout(myObj.showName, 1000);
```

这里输出 1，这个时候 this 指向了全局对象 window，严格模式下是 undefined，可以这样修改

```js
// 箭头函数
setTimeout(() => {
  myObj.showName();
}, 1000);
// 或者 function 函数
setTimeout(function () {
  myObj.showName();
}, 1000);
```

或者

```js
setTimeout(myObj.showName.bind(myObj), 1000);
```

## 总结

- 为了支持定时器的实现，浏览器增加了延时队列
- 由于消息队列和系统级别的限定，setTimeout 不总能按照预期的时间执行，不能满足高时效性的任务
- 还存在一些其他问题，要注意

# Webapi：XMLHttpRequest 是怎么实现的

## 回调函数 VS 系统调用栈

什么是回调函数？

将一个函数作为参数传递给另外一个函数，那作为参数的这个函数就是回调函数

```js
let callback = function () {
  console.log('i am doing homework');
};
function doWork(cb) {
  console.log('start do work');
  cb();
  console.log('end do work');
}
doWork(callback);
```

再来看看异步回调的例子，我们把这种回调函数在主函数外部执行的过程称为异步回调

```js
let callback = function () {
  console.log('i am doing homework');
};
function doWork(cb) {
  console.log('start do work');
  setTimeout(cb, 1000);
  console.log('end do work');
}
doWork(callback);
```

回顾下页面的事件循环系统，浏览器页面是通过事件循环机制驱动的，每个渲染进程都有一个消息队列，页面主线程按照消息队列的顺序执行消息队列中的任务，比如执行 js 事件，解析 dom 事件，计算布局事件，用户输入事件等。如果有新的事件产生，则放在事件队列的尾部，消息队列和主线程循环机制保证了页面有条不紊的执行

循环系统在执行任务的时候，为这个任务维护一个系统的调用栈，类似于 js 的调用栈，只不过是浏览器开发的 c++ 语言维护的

![](/img/posts/browser/loop/11.png)

如上图，记录了一个 parseHTML 的任务执行过程，黄色的标示 js 执行的过程，其他代表浏览器系统内部的执行过程

Parse HTML 执行过程中遇到一系列的子过程，比如解析过程中遇到了 js 脚本，那么暂停解析执行 js 脚本，执行完成后恢复解析，遇到 css 开始解析样式，知道整个过程完成

Parse HTML 是一个完整的任务，执行过程中的脚本解析、样式表解析都是该任务的子过程，下拉的长条就是执行过程中调用栈的信息

每个任务执行的时候都有自己的调用栈，同步回调就是在当前主函数上下文执行回调函数

异步函数在主函数外执行，一般有两种情况

- 异步函数作为一个任务，添加到消息队列尾部
- 异步函数添加到微任务列表，可以保证在当前任务的尾部执行微任务

## XMLHttpRequest 运作机制

我们看下 xhr 的整体流程

![](/img/posts/browser/loop/12.png)

分析从发起请求到接收数据的完整流程

```js
function GetWebData(URL) {
  /**
   * 1: 新建 XMLHttpRequest 请求对象
   */
  let xhr = new XMLHttpRequest();

  /**
   * 2: 注册相关事件回调处理函数
   */
  xhr.onreadystatechange = function () {
    switch (xhr.readyState) {
      case 0: // 请求未初始化
        console.log(' 请求未初始化 ');
        break;
      case 1: //OPENED
        console.log('OPENED');
        break;
      case 2: //HEADERS_RECEIVED
        console.log('HEADERS_RECEIVED');
        break;
      case 3: //LOADING
        console.log('LOADING');
        break;
      case 4: //DONE
        if (this.status == 200 || this.status == 304) {
          console.log(this.responseText);
        }
        console.log('DONE');
        break;
    }
  };

  xhr.ontimeout = function (e) {
    console.log('ontimeout');
  };
  xhr.onerror = function (e) {
    console.log('onerror');
  };

  /**
   * 3: 打开请求
   */
  xhr.open('Get', URL, true); // 创建一个 Get 请求, 采用异步

  /**
   * 4: 配置参数
   */
  xhr.timeout = 3000; // 设置 xhr 请求的超时时间
  xhr.responseType = 'text'; // 设置响应返回的数据格式
  xhr.setRequestHeader('X_TEST', '🐱');

  /**
   * 5: 发送请求
   */
  xhr.send();
}
```

### 创建 XMLHttpRequest 对象

```js
let xhr = new XMLHttpRequest();
```

JavaScript 会创建一个 XMLHttpRequest 对象 xhr，用来执行实际的网络请求操作

### 为 xhr 对象注册回调函数

网络请求比较耗时，要注册回调函数，后台执行结束后通过回调函数告诉结果

回调函数的结果有下面几种

- ontimeout，用来监控超时请求，如果后台请求超时了，该函数会被调用
- onerror，用来监控出错信息，如果后台请求出错了，该函数会被调用
- onreadystatechange，用来监控后台请求过程中的状态，比如可以监控到 HTTP 头加载完成的消息、HTTP 响应体消息以及数据加载完成的消息等

### 配置基础的请求信息

通过 open 接口配置一些基础的请求信息，包括请求的地址、请求方法（是 get 还是 post）和请求方式（同步还是异步请求）

通过 xhr 内部属性类配置一些其他可选的请求信息，比如 `xhr.timeout = 3000` 来配置超时时间

`xhr.responseType = "text"` 来配置服务器返回的格式，把服务器返回的数据转成我们想要的数据格式

以下是常见的一些返回类型：

![](/img/posts/browser/loop/13.png)

还需要添加自己专用的请求头属性，可以通过 xhr.setRequestHeader 来添加

### 发起请求

渲染进程发请求给网络进程，网络进程负责资源的下载，网络进程接收到数据后，利用 IPC 通知渲染进程，渲染进程收到消息后，会把 xhr 的回调函数封装成任务并添加到消息队列中，等主线程循环系统执行到该任务的时候，根据对应的状态调用对应的回调函数

- 如果网络请求出错了，就会执行 xhr.onerror
- 如果超时了，就会执行 xhr.ontimeout
- 如果是正常的数据接收，就会执行 onreadystatechange 来反馈相应的状态

## XMLHttpRequest 使用过程中的“坑”

浏览器安全问题，前端开发工程师是无法避免的

### 跨域问题

不同源的 xhr 请求，默认是不允许的，会提示 `has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

### HTTPS 混合内容的问题

HTTPS 混合内容是 HTTPS 页面中包含了不符合 HTTPS 安全要求的内容，比如包含了 HTTP 资源，通过 HTTP 加载的图像、视频、样式表、脚本等，都属于混合内容

如果 HTTPS 请求页面中使用混合内容，浏览器会针对 HTTPS 混合内容显示警告，用来向用户表明此 HTTPS 页面包含不安全的资源

通过 HTML 文件加载的混合资源，虽然给出警告，但大部分类型还是能加载的。而使用 xhr 请求时，浏览器认为这种请求可能是攻击者发起的，会阻止此类危险的请求

## 总结

- 介绍了回调函数和系统调用栈
- 循环系统的角度分析 xhr 怎么工作的
- 讲了一些安全因素，遇到的跨域和混合内容问题

本章将回调类型、循环系统、网络请求和安全问题“串联”起来了

对比上一章

- setTimeout 是直接将延迟任务添加到延迟队列中
- 而 XMLHttpRequest 发起请求，是由浏览器的其他进程或者线程去执行，然后再将执行结果利用 IPC 的方式通知渲染进程，之后渲染进程再将对应的消息添加到消息队列中

如果你搞懂了 setTimeout 和 XMLHttpRequest 的工作机制后，再来理解其他 WebAPI 就会轻松很多了，因为大部分 WebAPI 的工作逻辑都是类似的

# 宏任务和微任务：不是所有的任务都是一个待遇

微任务可以在实时性和效率之间做一个有效的权衡

微任务已经被广泛地应用，基于微任务的技术有 MutationObserver、Promise 以及以 Promise 为基础开发出来的很多其他的技术

微任务的重要性也与日俱增，了解其底层的工作原理对于你读懂别人的代码，以及写出更高效、更具现代的代码有着决定性的作用

有微任务，也就有宏任务，那这二者到底有什么区别？它们又是如何相互取长补短的？

## 宏任务

页面中的大部分任务都是在主线程上执行的，这些任务包括了

- 渲染事件（如解析 DOM、计算布局、绘制）；
- 用户交互事件（如鼠标点击、滚动页面、放大缩小等）；
- JavaScript 脚本执行事件；
- 网络请求完成、文件读写完成事件。

为了协调这些任务有条不紊地在主线程上执行，页面进程引入了消息队列和事件循环机制

渲染进程内部会维护多个消息队列，比如延迟执行队列和普通的消息队列

主线程采用一个 for 循环，不断地从这些任务队列中取出任务并执行任务

我们把这些消息队列中的任务称为宏任务

消息队列中的任务是通过事件循环系统来执行的，这里我们可以看看在 WHATWG 规范中是怎么定义事件循环机制的

- 先从多个消息队列中选出一个最老的任务，这个任务称为 oldestTask
- 循环系统记录任务开始执行的时间，并把这个 oldestTask 设置为当前正在执行的任务
- 当任务执行完成之后，删除当前正在执行的任务，并从对应的消息队列中删除掉这个 oldestTask
- 统计执行完成的时长等信息

以上就是消息队列中宏任务的执行过程

宏任务可以满足我们大部分的日常需求，不过如果有对时间精度要求较高的需求，宏任务就难以胜任了

页面的渲染事件、各种 IO 的完成事件、执行 JavaScript 脚本的事件、用户交互的事件等都随时有可能被添加到消息队列中，而且添加事件是由系统操作的，JavaScript 代码不能准确掌控任务要添加到队列中的位置，控制不了任务在消息队列中的位置，所以很难控制开始执行任务的时间

比如：

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="demo">
      <ol>
        <li>test</li>
      </ol>
    </div>
  </body>
  <script type="text/javascript">
    function timerCallback2() {
      console.log(2);
    }
    function timerCallback() {
      console.log(1);
      setTimeout(timerCallback2, 0);
    }
    setTimeout(timerCallback, 0);
  </script>
</html>
```

目的是想通过 setTimeout 来设置两个回调任务，并让它们按照前后顺序来执行，中间也不要再插入其他的任务

如果这两个任务的中间插入了其他的任务，就很有可能会影响到第二个定时器的执行时间了

实际情况是我们不能控制的，比如在你调用 setTimeout 来设置回调任务的间隙，消息队列中就有可能被插入很多系统级的任务

![](/img/posts/browser/loop/14.png)

setTimeout 函数触发的回调函数都是宏任务，如上图，左右两个黄色块就是 setTimeout 触发的两个定时器任务

重点观察上图中间浅红色区域，这里有很多一段一段的任务，这些是被渲染引擎插在两个定时器任务中间的任务

如果中间被插入的任务执行时间过久的话，那么就会影响到后面任务的执行了

宏任务的时间粒度比较大，执行的时间间隔是不能精确控制的，对一些高实时性的需求就不太符合了

## 微任务

我们介绍过异步回调的概念，其主要有两种方式

- 第一种是把异步回调函数封装成一个宏任务，添加到消息队列尾部，当循环系统执行到该任务的时候执行回调函数。这种比较好理解，我们前面介绍的 setTimeout 和 XMLHttpRequest 的回调函数都是通过这种方式来实现的
- 第二种方式的执行时机是在主函数执行结束之后、当前宏任务结束之前执行回调函数，这通常都是以微任务形式体现的

微任务就是一个需要异步执行的函数，执行时机是在主函数执行结束之后、当前宏任务结束之前。

我们知道当 JavaScript 执行一段脚本的时候，V8 会为其创建一个全局执行上下文，在创建全局执行上下文的同时，V8 引擎也会在内部创建一个微任务队列

这个微任务队列就是用来存放微任务的，因为在当前宏任务执行的过程中，有时候会产生多个微任务，这时候就需要使用这个微任务队列来保存这些微任务了

每个宏任务都关联了一个微任务队列，分析两个重要的时间点：微任务产生的时机和执行微任务队列的时机

现代浏览器里面，产生微任务有两种方式：

- 使用 MutationObserver 监控某个 DOM 节点，然后再通过 JavaScript 来修改这个节点，或者为这个节点添加、删除部分子节点，当 DOM 节点发生变化时，就会产生 DOM 变化记录的微任务
- 使用 Promise，当调用 Promise.resolve() 或者 Promise.reject() 的时候，也会产生微任务

通过 DOM 节点变化产生的微任务或者使用 Promise 产生的微任务都会被 JavaScript 引擎按照顺序保存到微任务队列中

在当前宏任务中的 JavaScript 快执行完成时，也就在 JavaScript 引擎准备退出全局执行上下文并清空调用栈的时候，JavaScript 引擎会检查全局执行上下文中的微任务队列，然后按照顺序执行队列中的微任务

WHATWG 把执行微任务的时间点称为检查点

在执行微任务的过程中，产生了新的微任务，同样会将该微任务添加到微任务队列中，V8 引擎一直循环执行微任务队列中的任务，直到队列为空才算执行结束

执行微任务过程中产生的新的微任务并不会推迟到下个宏任务中执行，而是在当前的宏任务中继续执行

![](/img/posts/browser/loop/15.png)

![](/img/posts/browser/loop/16.png)

上图执行一个 ParseHTML 的宏任务，在执行过程中，遇到了 JavaScript 脚本，那么就暂停解析流程，进入到 JavaScript 的执行环境

全局上下文中包含了微任务列表

在 JavaScript 脚本的后续执行过程中，分别通过 Promise 和 removeChild 创建了两个微任务，并被添加到微任务列表中。接着 JavaScript 执行结束，准备退出全局执行上下文，这时候就到了检查点了，JavaScript 引擎会检查微任务列表，发现微任务列表中有微任务，那么接下来，依次执行这两个微任务。等微任务队列清空之后，就退出全局执行上下文。

以上就是微任务的工作流程，从上面分析我们可以得出如下几个结论

- 微任务和宏任务是绑定的，每个宏任务在执行时，会创建自己的微任务队列
- 微任务的执行时长会影响到当前宏任务的时长。比如一个宏任务在执行过程中，产生了 100 个微任务，执行每个微任务的时间是 10 毫秒，那么执行这 100 个微任务的时间就是 1000 毫秒，也可以说这 100 个微任务让宏任务的执行时间延长了 1000 毫秒
- 在一个宏任务中，分别创建一个用于回调的宏任务和微任务，无论什么情况下，微任务都早于宏任务执行

## 监听 DOM 变化方法演变

MutationObserver 是用来监听 DOM 变化的一套方法，而监听 DOM 变化一直是前端工程师一项非常核心的需求

虽然监听 DOM 的需求是如此重要，不过早期页面并没有提供对监听的支持，所以那时要观察 DOM 是否变化，唯一能做的就是轮询检测

比如使用 setTimeout 或者 setInterval 来定时检测 DOM 是否有改变。这种方式简单粗暴，但是会遇到两个问题：如果时间间隔设置过长，DOM 变化响应不够及时；反过来如果时间间隔设置过短，又会浪费很多无用的工作量去检查 DOM，会让页面变得低效

2000 年的时候引入了 Mutation Event，Mutation Event 采用了观察者的设计模式，当 DOM 有变动时就会立刻触发相应的事件，这种方式属于同步回调

采用 Mutation Event 解决了实时性的问题，因为 DOM 一旦发生变化，就会立即调用 JavaScript 接口。但也正是这种实时性造成了严重的性能问题，因为每次 DOM 变动，渲染引擎都会去调用 JavaScript，这样会产生较大的性能开销

利用 JavaScript 动态创建或动态修改 50 个节点内容，就会触发 50 次回调，而且每个回调函数都需要一定的执行时间，这里我们假设每次回调的执行时间是 4 毫秒，那么 50 次回调的执行时间就是 200 毫秒，若此时浏览器正在执行一个动画效果，由于 Mutation Event 触发回调事件，就会导致动画的卡顿。

也正是因为使用 Mutation Event 会导致页面性能问题，所以 Mutation Event 被反对使用，并逐步从 Web 标准事件中删除了

为了解决了 Mutation Event 由于同步调用 JavaScript 而造成的性能问题，从 DOM4 开始，推荐使用 MutationObserver 来代替 Mutation Event。MutationObserver API 可以用来监视 DOM 的变化，包括属性的变化、节点的增减、内容的变化等

相比较 Mutation Event，MutationObserver 到底做了哪些改进呢

MutationObserver 将响应函数改成异步调用，可以不用在每次 DOM 变化都触发异步调用，而是等多次 DOM 变化后，一次触发异步调用，并且还会使用一个数据结构来记录这期间所有的 DOM 变化，即使频繁地操纵 DOM，也不会对性能造成太大的影响

异步调用和减少触发次数来缓解了性能问题，那么如何保持消息通知的及时性呢？

如果采用 setTimeout 创建宏任务来触发回调的话，那么实时性就会大打折扣，因为上面我们分析过，在两个任务之间，可能会被渲染进程插入其他的事件，从而影响到响应的实时性

微任务就可以上场了，在每次 DOM 节点发生变化的时候，渲染引擎将变化记录封装成微任务，并将微任务添加进当前的微任务队列中。这样当执行到检查点的时候，V8 引擎就会按照顺序执行微任务了。

MutationObserver 采用了“异步 + 微任务”的策略。

- 通过异步操作解决了同步操作的性能问题
- 通过微任务解决了实时性的问题

## 总结

- 回顾了宏任务，在这个基础上分析了异步回调函数的两种类型，微任务是后一种
- 详细分析了浏览器如何实现微任务的，包括了微任务队列和检查点
- 监听 DOM 变化的 API 演变。从轮询到 Mutation Event 再到最新使用的 MutationObserver。MutationObserver 核心采用了微任务机制，有效权衡了时效性和效率

# 使用 Promise 告别回调函数

DOM/BOM API 中新加入的 API 大多数都是建立在 Promise 上的，而且新的前端框架也使用了大量的 Promise。可以这么说，Promise 已经成为现代前端的“水”和“电”，很是关键，所以深入学习 Promise 势在必行

想要了解一门技术，最好从他的发展史看起，以及它解决了什么问题，了解了这些，才能抓住本质

Promise 解决的是异步编码风格的问题，接下来围绕这个主题来讲

## 异步编程的问题：代码逻辑不连续

我们回顾下浏览器的异步编程模型，我们应该非常清楚

- 事件循环系统
- 页面中的任务在渲染进程的主线程上执行

对于页面来说，主线程就是它的世界

一些耗时的任务，比如下载文件，获取摄像头等，都会放在页面主线程之外的进程或者线程处理，避免了耗时任务霸占主线程的情况

![](/img/posts/browser/loop/17.png)

上图是标准的异步编程模型，主线程发起一个耗时的任务，交给另外一个进程处理，页面主进程继续处理消息队列中的任务。等该进程处理完结果后，会把任务添加到主线程的消息队列中，排队等待循环系统。排队结束后，循环取出消息队列中的人物进行处理，触发相关的回调操作

这就是异步回调

web 单线程决定了异步回调，而异步回调决定了我们的编码方法

```js
// 执行状态
function onResolve(response) {
  console.log(response);
}
function onReject(error) {
  console.log(error);
}

let xhr = new XMLHttpRequest();
xhr.ontimeout = function (e) {
  onReject(e);
};
xhr.onerror = function (e) {
  onReject(e);
};
xhr.onreadystatechange = function () {
  onResolve(xhr.response);
};

// 设置请求类型，请求 URL，是否同步信息
let URL = 'https://time.geekbang.com';
xhr.open('Get', URL, true);

// 设置参数
xhr.timeout = 3000; // 设置 xhr 请求的超时时间
xhr.responseType = 'text'; // 设置响应返回的数据格式
xhr.setRequestHeader('X_TEST', 'time.geekbang');

// 发出请求
xhr.send();
```

短短一段代码出现了 5 次回调，这么多回调会导致代码逻辑不连贯，不线性，不符合常规的人类思维

我们可以封装下这段代码，降低回调的次数

## 封装异步代码，让处理流程变得线性

![](/img/posts/browser/loop/18.png)

我们把 xhr 的请求封装起来，重点关注数据的输入与输出

首先我们把 http 请求信息都放在一个 request 结构中，包括请求头，请求地址，请求方式，引用地址，同步请求还是是异步请求

```js
//makeRequest 用来构造 request 对象
function makeRequest(request_url) {
  let request = {
    method: 'Get',
    url: request_url,
    headers: '',
    body: '',
    credentials: false,
    sync: true,
    responseType: 'text',
    referrer: '',
  };
  return request;
}
```

然后封装请求过程，xFetch 函数

```js
//[in] request，请求信息，请求头，延时值，返回类型等
//[out] resolve, 执行成功，回调该函数
//[out] reject  执行失败，回调该函数
function XFetch(request, resolve, reject) {
  let xhr = new XMLHttpRequest();
  xhr.ontimeout = function (e) {
    reject(e);
  };
  xhr.onerror = function (e) {
    reject(e);
  };
  xhr.onreadystatechange = function () {
    if ((xhr.status = 200)) resolve(xhr.response);
  };
  xhr.open(request.method, URL, request.sync);
  xhr.timeout = request.timeout;
  xhr.responseType = request.responseType;
  // 补充其他请求信息
  //...
  xhr.send();
}
```

实现业务代码：

```js
XFetch(
  makeRequest('https://time.geekbang.org'),
  function resolve(data) {
    console.log(data);
  },
  function reject(e) {
    console.log(e);
  }
);
```

## 新的问题：回调地狱

如果有太多的回调函数，会陷入回调地狱

```js
XFetch(makeRequest('https://time.geekbang.org/?category'),
  function resolve(response) {
      console.log(response)
      XFetch(makeRequest('https://time.geekbang.org/column'),
          function resolve(response) {
              console.log(response)
              XFetch(makeRequest('https://time.geekbang.org')
                  function resolve(response) {
                      console.log(response)
                  }, function reject(e) {
                      console.log(e)
                  })
          }, function reject(e) {
              console.log(e)
          })
  }, function reject(e) {
      console.log(e)
  })
```

这段代码看起来很乱，主要是因为

- 嵌套调用，下面的任务依赖上面任务的请求结果，并在上个任务的回调函数内部执行新的业务逻辑，嵌套多了以后代码的可读性非常差
- 任务的不确定性，每个任务都有成功和失败的可能，体现在代码中就是需要每次都进行两次判断，也增加了代码的混乱

我们需要解决的方法：

- 消灭嵌套
- 合并多个错误处理

Promise 可以帮我们解决

## Promise：消灭嵌套调用和多次错误处理

我们用 promise 重构代码

```js
function XFetch(request) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', request.url, true);
    xhr.ontimeout = function (e) {
      reject(e);
    };
    xhr.onerror = function (e) {
      reject(e);
    };
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(this.responseText, this);
        } else {
          let error = {
            code: this.status,
            response: this.response,
          };
          reject(error, this);
        }
      }
    };
    xhr.send();
  });
}
```

接下来进行请求处理

```js
var x1 = XFetch(makeRequest('https://time.geekbang.org/?category'));
var x2 = x1.then((value) => {
  console.log(value);
  return XFetch(makeRequest('https://www.geekbang.org/column'));
});
var x3 = x2.then((value) => {
  console.log(value);
  return XFetch(makeRequest('https://time.geekbang.org'));
});
x3.catch((error) => {
  console.log(error);
});
```

- 首先引入了 Promise，在调用 xFetch 的时候返回一个 Promise
- 构建 promise 的时候需要传入一个 executor 函数，xFetch 主要业务都在这个里面进行的
- executor 执行成功会调用 resolve 函数，失败调用 reject 函数
- executor 调用 resolve 会触发 promise.then 设置的回调函数，调用 reject 会触发 promise.catch 设置的回调函数

上面这段代码看起来就非常线性了，也非常符合人的直觉

先来看看 Promise 是怎么消灭嵌套回调的。产生嵌套函数的一个主要原因是在发起任务请求时会带上回调函数，这样当任务处理结束之后，下个任务就只能在回调函数中来处理了

Promise 主要通过下面两步解决嵌套回调问题的

Promise 实现了回调函数的延时绑定，在代码上的体现是先创建了 promise x1 对象，通过 promise 的构造函数 executor 来执行业务逻辑

创建了 promise x1 对象后，在调用 x1.then 来设置回调函数

```js
// 创建 Promise 对象 x1，并在 executor 函数中执行业务逻辑
function executor(resolve, reject) {
  resolve(100);
}
let x1 = new Promise(executor);

//x1 延迟绑定回调函数 onResolve
function onResolve(value) {
  console.log(value);
}
x1.then(onResolve);
```

其次，需要将回调函数 onResolve 的返回值穿透到最外层。因为我们会根据 onResolve 函数的传入值来决定创建什么类型的 Promise 任务，创建好的 Promise 对象需要**返回到最外层**，这样就可以摆脱嵌套循环了

![](/img/posts/browser/loop/19.png)

现在我们知道了 Promise 通过回调函数延迟绑定和回调函数返回值穿透的技术，解决了循环嵌套。

那接下来我们再来看看 Promise 是怎么处理异常的

```js
function executor(resolve, reject) {
  let rand = Math.random();
  console.log(1);
  console.log(rand);
  if (rand > 0.5) resolve();
  else reject();
}
var p0 = new Promise(executor);

var p1 = p0.then((value) => {
  console.log('succeed-1');
  return new Promise(executor);
});

var p3 = p1.then((value) => {
  console.log('succeed-2');
  return new Promise(executor);
});

var p4 = p3.then((value) => {
  console.log('succeed-3');
  return new Promise(executor);
});

p4.catch((error) => {
  console.log('error');
});
console.log(2);
```

这段代码有四个 Promise 对象：p0 ～ p4。无论哪个对象里面抛出异常，都可以通过最后一个对象 p4.catch 来捕获异常，通过这种方式可以将所有 Promise 对象的错误合并到一个函数来处理，这样就解决了每个任务都需要单独处理异常的问题。

之所以可以使用最后一个对象来捕获所有异常，是因为 Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被 onReject 函数处理或 catch 语句捕获为止

具备了这样“冒泡”的特性后，就不需要在每个 Promise 对象中单独捕获异常了

通过这种方式，我们就消灭了嵌套调用和频繁的错误处理，这样使得我们写出来的代码更加优雅，更加符合人的线性思维。

## Promise 与微任务

Promise 和微任务的关系到底体现哪里呢

```js
function executor(resolve, reject) {
  resolve(100);
}
let demo = new Promise(executor);

function onResolve(value) {
  console.log(value);
}
demo.then(onResolve);
```

- 首先执行 new Promise 时，Promise 的构造函数会被执行，不过由于 Promise 是 V8 引擎提供的，所以暂时看不到 Promise 构造函数的细节
- 接下来，Promise 的构造函数会调用 Promise 的参数 executor 函数。然后在 executor 中执行了 resolve，resolve 函数也是在 V8 内部实现的，那么 resolve 函数到底做了什么呢？我们知道，执行 resolve 函数，会触发 demo.then 设置的回调函数 onResolve，所以可以推测，resolve 函数内部调用了通过 demo.then 设置的 onResolve 函数。
- 不过这里需要注意一下，由于 Promise 采用了回调函数延迟绑定技术，所以在执行 resolve 函数的时候，回调函数还没有绑定，那么只能推迟回调函数的执行

我们来模拟一个 promise

实现它的构造函数、resolve 方法以及 then 方法，以方便你能看清楚 Promise 的背后都发生了什么

```js
function Bromise(executor) {
  var onResolve_ = null;
  var onReject_ = null;

  //  模拟实现 resolve 和 then，暂不支持 rejcet
  this.then = function (res, rej) {
    onResolve_ = res;
  };

  function resolve(value) {
    //setTimeout(()=>{
    onResolve_(value);
    // },0)
  }

  executor(resolve, null);
}
```

我们实现了自己的构造函数、resolve、then 方法

```js
function executor(resolve, reject) {
  resolve(100);
}
// 将 Promise 改成我们自己的 Bromsie
let demo = new Bromise(executor);

function onResolve(value) {
  console.log(value);
}
demo.then(onResolve);
```

执行这段代码，我们发现执行出错，输出的内容是

```js
Uncaught TypeError: onResolve_ is not a function
    at resolve (<anonymous>:10:13)
    at executor (<anonymous>:17:5)
    at new Bromise (<anonymous>:13:5)
    at <anonymous>:19:12
```

Bromise 的延迟绑定导致的，在调用到 `onResolve_` 函数的时候，Bromise.then 还没有执行，所以执行上述代码的时候，当然会报 "`onResolve_` is not a function" 的错误

也正是因为此，我们要改造 Bromise 中的 resolve 方法，让 resolve 延迟调用 `onResolve_`

```js
function resolve(value) {
  setTimeout(() => {
    onResolve_(value);
  }, 0);
}
```

上面采用了定时器来推迟 onResolve 的执行，不过使用定时器的效率并不是太高，好在我们有微任务，所以 Promise 又把这个定时器改造成了微任务了，这样既可以让 `onResolve_` 延时被调用，又提升了代码的执行效率。这就是 Promise 中使用微任务的原由了

## 总结

- 我们回顾了 Web 页面是单线程架构模型，这种模型决定了我们编写代码的形式 - 异步编程
- 基于异步编程模型写出来的代码会把一些关键的逻辑点打乱，所以这种风格的代码不符合人的线性思维方式
- 我们试着把一些不必要的回调接口封装起来，简单封装取得了一定的效果，不过，在稍微复制点的场景下依然存在着回调地狱的问题
- 分析了产生回调地狱的原因
  - 多层嵌套的问题
  - 每种任务的处理结果存在两种可能性（成功或失败），那么需要在每种任务执行结束后分别处理这两种可能性
- Promise 通过回调函数延迟绑定、回调函数返回值穿透和错误“冒泡”技术解决了上面的两个问题
- 最后我们还分析了 Promise 之所以要使用微任务是由 Promise 回调函数延迟绑定技术导致的

# async await 使用同步方式写异步代码

使用 Promise 能很好地解决回调地狱的问题，但是这种方式充满了 Promise 的 then() 方法，如果处理流程比较复杂的话，那么整段代码将充斥着 then，语义化不明显，代码不能很好地表示执行流程

```js
fetch('https://www.geekbang.org')
  .then((response) => {
    console.log(response);
    return fetch('https://www.geekbang.org/test');
  })
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
```

使用 promise.then 也是相当复杂，虽然整个请求流程已经线性化了，但是代码里面包含了大量的 then 函数，使得代码依然不是太容易阅读

基于这个原因，ES7 引入了 async/await，这是 JavaScript 异步编程的一个重大改进，提供了在不阻塞主线程的情况下使用同步代码实现异步访问资源的能力，并且使得代码逻辑更加清晰

```js
async function foo() {
  try {
    let response1 = await fetch('https://www.geekbang.org');
    console.log('response1');
    console.log(response1);
    let response2 = await fetch('https://www.geekbang.org/test');
    console.log('response2');
    console.log(response2);
  } catch (err) {
    console.error(err);
  }
}
foo();
```

整个异步处理的逻辑都是使用同步代码的方式来实现的

支持 try catch 来捕获异常，这就是完全在写同步代码，所以是非常符合人的线性思维的

继续深入，看看 JavaScript 引擎是如何实现 async/await 的

我们首先介绍生成器（Generator）是如何工作的，接着讲解 Generator 的底层实现机制——协程（Coroutine）；又因为 async/await 使用了 Generator 和 Promise 两种技术，所以紧接着我们就通过 Generator 和 Promise 来分析 async/await 到底是如何以同步的方式来编写异步代码的

## 生成器 VS 协程

生成器函数是一个带星号函数，而且是可以暂停执行和恢复执行的

```js
function* genDemo() {
  console.log(' 开始执行第一段 ');
  yield 'generator 1';

  console.log(' 开始执行第二段 ');
  yield 'generator 2';

  console.log(' 开始执行第三段 ');
  yield 'generator 3';

  console.log(' 执行结束 ');
  return 'generator 4';
}

console.log('main 0');
let gen = genDemo();
console.log(gen.next().value); // 开始执行第一段 generator 1
console.log('main 1');
console.log(gen.next().value); // 开始执行第二段  generator 2
console.log('main 2');
console.log(gen.next().value); // 开始执行第三段  generator 3
console.log('main 3');
console.log(gen.next().value); // 执行结束  generator 4
console.log('main 4');
```

发现函数 genDemo 并不是一次执行完的，全局代码和 genDemo 函数交替执行。其实这就是生成器函数的特性，可以暂停执行，也可以恢复执行

下面我们就来看看生成器函数的具体使用方式

- 在生成器函数内部执行一段代码，如果遇到 yield 关键字，那么 JavaScript 引擎将返回关键字后面的内容给外部，并暂停该函数的执行
- 外部函数可以通过 next 方法恢复函数的执行

那么接下来我们就来简单介绍下 JavaScript 引擎 V8 是如何实现一个函数的暂停和恢复的，这也会有助于你理解后面要介绍的 async/await

要搞懂函数为何能暂停和恢复，那你首先要了解协程的概念。

协程是一种比线程更加轻量级的存在。

你可以把协程看成是跑在线程上的任务，一个线程上可以存在多个协程，但是在线程上同时只能执行一个协程

比如当前执行的是 A 协程，要启动 B 协程，那么 A 协程就需要将主线程的控制权交给 B 协程，这就体现在 A 协程暂停执行，B 协程恢复执行，同样，也可以从 B 协程中启动 A 协程

如果从 A 协程启动 B 协程，我们就把 A 协程称为 B 协程的父协程

正如一个进程可以拥有多个线程一样，一个线程也可以拥有多个协程

最重要的是，协程不是被操作系统内核所管理，而完全是由程序所控制（也就是在用户态执行），这样带来的好处就是性能得到了很大的提升，不会像线程切换那样消耗资源。

结合上面那段代码的执行过程，画出了下面的“协程执行流程图”，你可以对照着代码来分析

![](/img/posts/browser/loop/20.png)

看出来协程的四点规则

- 通过调用生成器函数 genDemo 来创建一个协程 gen，创建之后，gen 协程并没有立即执行
- 要让 gen 协程执行，需要通过调用 gen.next
- 当协程正在执行的时候，可以通过 yield 关键字来暂停 gen 协程的执行，并返回主要信息给父协程
- 如果协程在执行期间，遇到了 return 关键字，那么 JavaScript 引擎会结束当前协程，并将 return 后面的内容返回给父协程

你可能又有这样疑问：父协程有自己的调用栈，gen 协程时也有自己的调用栈，当 gen 协程通过 yield 把控制权交给父协程时，V8 是如何切换到父协程的调用栈？当父协程通过 gen.next 恢复 gen 协程时，又是如何切换 gen 协程的调用栈

需要关注以下两点内容

- gen 协程和父协程是在主线程上交互执行的，并不是并发执行的，它们之前的切换是通过 yield 和 gen.next 来配合完成的
- 当在 gen 协程中调用了 yield 方法时，JavaScript 引擎会保存 gen 协程当前的调用栈信息，并恢复父协程的调用栈信息。同样，当在父协程中执行 gen.next 时，JavaScript 引擎会保存父协程的调用栈信息，并恢复 gen 协程的调用栈信息

直观理解父协程和 gen 协程是如何切换调用栈的，你可以参考下图

![](/img/posts/browser/loop/21.png)

在 JavaScript 中，生成器就是协程的一种实现方式，这样相信你也就理解什么是生成器了

我们使用生成器和 Promise 来改造开头的那段 Promise 代码。改造后的代码如下所示

```js
//foo 函数
function* foo() {
  let response1 = yield fetch('https://www.geekbang.org');
  console.log('response1');
  console.log(response1);
  let response2 = yield fetch('https://www.geekbang.org/test');
  console.log('response2');
  console.log(response2);
}

// 执行 foo 函数的代码
let gen = foo();
function getGenPromise(gen) {
  return gen.next().value;
}
getGenPromise(gen)
  .then((response) => {
    console.log('response1');
    console.log(response);
    return getGenPromise(gen);
  })
  .then((response) => {
    console.log('response2');
    console.log(response);
  });
```

foo 函数是一个生成器函数，在 foo 函数里面实现了用同步代码形式来实现异步操作；但是在 foo 函数外部，我们还需要写一段执行 foo 函数的代码，如上述代码的后半部分所示，那下面我们就来分析下这段代码是如何工作的

- 首先执行的是 let gen = foo()，创建了 gen 协程
- 然后在父协程中通过执行 gen.next 把主线程的控制权交给 gen 协程
- gen 协程获取到主线程的控制权后，就调用 fetch 函数创建了一个 Promise 对象 response1，然后通过 yield 暂停 gen 协程的执行，并将 response1 返回给父协程
- 父协程恢复执行后，调用 response1.then 方法等待请求结果
- 等通过 fetch 发起的请求完成之后，会调用 then 中的回调函数，then 中的回调函数拿到结果之后，通过调用 gen.next 放弃主线程的控制权，将控制权交 gen 协程继续执行下个请求

以上就是协程和 Promise 相互配合执行的一个大致流程。不过通常，我们把执行生成器的代码封装成一个函数，并把这个执行生成器代码的函数称为执行器（可参考著名的 co 框架），如下面这种方式

```js
function* foo() {
  let response1 = yield fetch('https://www.geekbang.org');
  console.log('response1');
  console.log(response1);
  let response2 = yield fetch('https://www.geekbang.org/test');
  console.log('response2');
  console.log(response2);
}
co(foo());
```

通过使用生成器配合执行器，就能实现使用同步的方式写出异步代码了，这样也大大加强了代码的可读性。

## async/await

虽然生成器已经能很好地满足我们的需求了，但是程序员的追求是无止境的，这不又在 ES7 中引入了 async/await，这种方式能够彻底告别执行器和生成器，实现更加直观简洁的代码。

async/await 技术背后的秘密就是 Promise 和生成器应用，往低层说就是微任务和协程应用。要搞清楚 async 和 await 的工作原理，我们就得对 async 和 await 分开分析

### async

async 是一个通过异步执行并隐式返回 Promise 作为结果的函数

对 async 函数的理解，这里需要重点关注两个词：异步执行和隐式返回 Promise

这里我们先来看看是如何隐式返回 Promise 的，你可以参考下面的代码

```js
async function foo() {
  return 2;
}

console.log(foo()); // Promise {<resolved>: 2}
```

我们可以看到调用 async 声明的 foo 函数返回了一个 Promise 对象，状态是 resolved，返回结果如下所示：

```js
Promise {<resolved>: 2}
```

### await

再结合文中这段代码来看看 await 到底是什么

```js
async function foo() {
  console.log(1);
  let a = await 100;
  console.log(a);
  console.log(2);
}
console.log(0);
foo();
console.log(3);
```

这得先来分析 async 结合 await 到底会发生什么

我们先站在协程的视角来看看这段代码的整体执行流程图

![](/img/posts/browser/loop/22.png)

分析下 async/await 的执行流程

执行 console.log(0)这个语句，打印出来 0

执行 foo 函数，由于 foo 函数是被 async 标记过的，所以当进入该函数的时候，JavaScript 引擎会保存当前的调用栈等信息，然后执行 foo 函数中的 console.log(1)语句，并打印出 1

执行到 foo 函数中的 await 100 这个语句了，这里是我们分析的重点，因为在执行 await 100 这个语句时，JavaScript 引擎在背后为我们默默做了太多的事情，那么下面我们就把这个语句拆开，来看看 JavaScript 到底都做了哪些事情

当执行到 await 100 时，会默认创建一个 Promise 对象，代码如下所示：

```js
let promise_ = new Promise((resolve,reject){
  resolve(100)
})
```

在这个 `promise_` 对象创建的过程中，我们可以看到在 executor 函数中调用了 resolve 函数，JavaScript 引擎会将该任务提交给微任务队列

然后 JavaScript 引擎会暂停当前协程的执行，将主线程的控制权转交给父协程执行，同时会将 `promise_` 对象返回给父协程

主线程的控制权已经交给父协程了，这时候父协程要做的一件事是调用 `promise_.then` 来监控 promise 状态的改变

接下来继续执行父协程的流程，这里我们执行 console.log(3)，并打印出来 3

随后父协程将执行结束，在结束之前，会进入微任务的检查点，然后执行微任务队列，微任务队列中有 resolve(100)的任务等待执行，执行到这里的时候，会触发 `promise_.then` 中的回调函数

```js
promise_.then((value) => {
  // 回调函数被激活后
  // 将主线程控制权交给 foo 协程，并将 value 值传给协程
});
```

该回调函数被激活以后，会将主线程的控制权交给 foo 函数的协程，并同时将 value 值传给该协程

foo 协程激活之后，会把刚才的 value 值赋给了变量 a，然后 foo 协程继续执行后续语句，执行完成之后，将控制权归还给父协程

以上就是 await/async 的执行流程。正是因为 async 和 await 在背后为我们做了大量的工作，所以我们才能用同步的方式写出异步代码来

## 总结

- Promise 的编程模型依然充斥着大量的 then 方法，虽然解决了回调地狱的问题，但是在语义方面依然存在缺陷，代码中充斥着大量的 then 函数，这就是 async/await 出现的原因
- 使用 async/await 可以实现用同步代码的风格来编写异步代码，这是因为 async/await 的基础技术使用了生成器和 Promise，生成器是协程的实现，利用生成器能实现生成器函数的暂停和恢复
- V8 引擎还为 async/await 做了大量的语法层面包装，所以了解隐藏在背后的代码有助于加深你对 async/await 的理解
- async/await 无疑是异步编程领域非常大的一个革新，也是未来的一个主流的编程风格。其实，除了 JavaScript，Python、Dart、C# 等语言也都引入了 async/await，使用它不仅能让代码更加整洁美观，而且还能确保该函数始终都能返回 Promise
