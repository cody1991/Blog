---
layout: post
title: TypeScript 入门笔记
tags: [typescript]
---

# 1-0 简介

TypeScript 主要添加了类型系统和对 ES6 的支持

类型系统按照「类型检查的时机」来分类，可以分为动态类型和静态类型。

- typescript 是静态类型，js 是动态类型
- 它们都是弱类型的，可以隐式类型转换

ts 和 js 可以共存，新需求用 ts，在慢慢去调整老的代码

ts 如果编译报错了，还是能生成 js 文件，可以调整 noEmitOnError 的配置

# 1-1 基础

## 1-1-1 原始数据类型

### boolean

```ts
const isDone: boolean = true;
```

定义 boolean 类型。通过 `new Boolean(true)` 的并不是基础类型 `boolean`，用的是 `Boolean`，但是一般也不会这么去定义，比较少用

### number

```ts
const aNumber: number = 1;
```

### string

```ts
const aString: string = 'hello';
```

### void

空值类型只能是 `undefined` 或者 `null` 进行赋值

不过默认情况下 ts-config 的配置是：`strictNullChecks: true`，所以 `void` 也不能赋值为 `null`

`void` 也不能赋值给其他类型

```ts
const aVoid: void = undefined; // or null;

function aVoidFunc(): void {
  console.log('没有返回值的函数，返回一个 undefined，是一个空值类型');
}
```

### null / undefined

```ts
const aNull: null = null;
const aUndefined: undefined = undefined;
```

~~另外他们两个是所有类型的子类型，可以赋值给其他类型。~~

严格模式下都不行

[demo](https://www.typescriptlang.org/play?ts=4.2.3#code/MYewdgzgLgBAlhAIuApgLhgIxCANigQzBgF4YoAnAVxQG4AoUSWAgOSoFtMUKMxPuFUjACMDJtBgEAypThgA5hmgV5C4QHIAFily4QGho3CSCANRBwAJhgBulq8KpgrKAGbyUjgPTeYIIX49IzdnYCg4cCkLawAxMIAKAEo0e2sYAG96GBgJPBQAOn0FBI1AQptASHNAFfjAPbVAHgVAELdAX8VAB1NAGH-awAA5QCo5GGdXDzAvNsB6Mx7ALy86wG8fQGj1DSSGAF96Y2Ypdj0+Kj1hINxxExYAVRd3Txs+08GvJyvz2iA)

## 1-1-2 任意值

任意值其实就是可以赋值任意值的类型

```ts
let aAny: any = 123;
aAny = 'string'; // 赋值其他类型不会报错
```

对任意值的任何操作（包括获取属性或者方法调用）返回的也是任意值，所以下面的代码不会报错

```ts
let aChainAny: any;

aChainAny.a().b().c();
```

未声明类型，它的类型为任意值

[demo](https://www.typescriptlang.org/play?#code/DYUwLgBAhgggdgTwFxURAvBAjAJgMwDcAUEaJFAMIAWUAlnPMtIsUZTfYwHRQAUAlFwBGArgGMBBIA)

## 1-1-3 类型推断

如果我们没有明确指定类型，但是又进行了赋值，ts 会进行类型推断

比如下面这段代码会报错 `Type 'string' is not assignable to type 'number'.`

```ts
let aAny = 123;
aAny = 'string';
```

[demo](https://www.typescriptlang.org/play?#code/DYUwLgBAhgggdgTwgXggRgEwGYDcAoWRFCAcgGcwAnASzgHMT8g)

## 1-1-4 联合类型

联合类型是我们前面提到的一些类型的集合，比如下面的 `aUnionValue` 可以赋值为多个字符串或者数字，但是不可以是其他类型

```ts
let aUnionValue: number | string = 1;
aUnionValue = '123';
```

如果要访问联合类型值某个属性或者方法，要联合类型里面的类型都存在才可以，否则报错

```ts
function aUnionFunc(args: number | string) {
  console.log(args.length);
}

// - Property 'length' does not exist on type 'string | number'.
//  Property 'length' does not exist on type 'number'.
```

[demo](https://www.typescriptlang.org/play?#code/DYUwLgBAhgqgdgSwPZwGpWAVxALgnTAWwCMQAnCAHwgGcwyE4BzCAXggEYBuAKFkRTosINhADkHAEwBmMbx4B6BRABmmOAGMwyONHg6AYuo0AKKGSY08BEuSq16jJgEoIAb0XKI3iBpQ0kUAA6YCQmMwsaEJBmMAALZ14lCABfIA)

## 1-1-5 对象的类型 - 接口

使用接口定义对象的类型

接口是一个行为的抽象，需要类去实现它

```ts
interface People {
  name: string;
  age: number;
}

const cody: People = {
  name: 'cody',
  age: 29,
};
```

我们定义一个 `People` 的接口，又定义了一个 `People` 类型的变量 `cody`。`cody`的形状一定要和 `People`一样才行

这里如果 `cody` 少了 `age` 属性，或者多了一个 `sex` 属性，都会报错

不过我们可以通过 `?` 来申明一个可选的字段，比如

```ts
interface People {
  name: string;
  age: number;
  sex?: 'male' | 'female';
}

const cody: People = {
  name: 'cody',
  age: 29,
};
```

这个时候 `sex` 属性不一定要去指定

我们可以添加任意属性，比如

```ts
interface People {
  name: string;
  age: number;
  sex?: 'male' | 'female';
  [prop: string]: any;
}

const cody: People = {
  name: 'cody',
  age: 29,
  hahaha: 123,
};
```

`[prop: string]: any;` 的属性值类型必须是所有值类型的联合类型，如果写成了 `[prop: string]: number` 那么会报错。下面是一个不会报错的例子

```ts
interface People {
  name: string;
  age: number;
  sex?: 'male' | 'female';
  [prop: string]: string | number | undefined;
}

const cody: People = {
  name: 'cody',
  age: 29,
  hahaha: 123,
};
```

我们也可以指定只读类型的属性

```ts
interface People {
  readonly id: number;
  name: string;
  age: number;
  sex?: 'male' | 'female';
  [prop: string]: string | number | undefined;
}

const cody: People = {
  id: 1,
  name: 'cody',
  age: 29,
  hahaha: 123,
};
```

如果我们去修改 `id` 属性值的时候就会报错

[demo](https://www.typescriptlang.org/play?ssl=14&ssc=2&pln=1&pc=1#code/JYOwLgpgTgZghgYwgAgAoQPYAcA2KDeAUMiclBHACYYg4CeywlAXMiAK4C2ARtADTFSIOJwisAzmCigA5gG5BJODLFsuvKAtLJxEAB4B+VgHJOcPMeQAfZMZgQzFraQDaWKNglTZAXS-SQGWs1Hmhg9hBKCBhQCEoFAF9CQgQaSWRUyjpWdGw8ZABeZCJtJlYARgFtYVETTLpjKtJlVQAmAE4mkgALOF7eitaAZgEEoA)

## 1-1-6 数组的类型

数组的类型定义有几种，下面一个个看看

### `type[]` 方式

比如下面这样，也可以和联合类型组合使用的。如果有不在 `type` 类型定义的值在的话就会报错。另外进行一些数组的操作，比如 `push()` 进去一个不是 `type` 类型的话也会报错

```ts
let aArray: (number | string)[] = [1, 2, 3, 4, 5, '1'];
```

### `Array<type>` 泛型方式

下面这个例子和上面的效果是一样的。泛型在后面的章节会再详细阐述

```ts
let bArray: Array<number | string> = [1, 2, 3, 4, 5, '1'];
```

### 接口形式

上面的效果是一样的。不过就复杂多了。

```ts
interface NumberAndStringArray {
  [index: number]: number | string;
}

let cArray: NumberAndStringArray = [1, 2, 3, 4, 5, '1'];
```

但是我们可以用这种方式来定义类数组

函数的 `arguments` 是类数组，如果我们用数组的方式给它定义，会报错。我们看看下面的例子

```ts
function aFunc() {
  let args: number[] = arguments;
  console.log(args);
}

// - Type 'IArguments' is missing the following properties from type 'number[]': pop, push, concat, join, and 24 more.
```

有个简单的修复方法是如下：

```ts
function bFunc() {
  let args: IArguments = arguments;
  console.log(args);
}
```

`ts` 给我们内置了一些接口，比如常用的 `IArguments` , `NodeList` , `HTMLCollection`

当然我们也可以自己实现一下 `IArguments`

```ts
interface MyNumberArguments {
  [index: number]: number;
  length: number;
  callee: Function;
}

function cFunc() {
  let args: MyNumberArguments = arguments;
  console.log(args);
}
```

[demo](https://www.typescriptlang.org/play?#code/DYUwLgBAhgggTnKBPAXBAFAOwK4FsBGIcAPgM5hwCWmA5gJQDaAuhALwQMCMANAEzcBmbgBZuAVm4ByTpKYBuAFALQkfPESoI65AB4cBImQrUaAPjYQOPfkNETpsxQupgiAMygBjEBAByeQjgYTAATAGVjWm0kCABvBUtLBmoQkAAPNH1ApkyAw3IqWkUAXyUVCE9olH8DINCIwppoiy4+QRFxKRl5JQB6Xog3bExPMEoAe0xoADFhz3Q6OIV+xMtyqDgaUlza5gsNmjwQTDBSRRXVz0nScdAAOmBxmnQD0jplgdKPwbmxyYh8LMRgslhdEutNtsIABJeCHXDHU77TZHE5nb6Xa63EAPJ4vSHvFZfFzuLw+ACySBqgThqKR8Q4KXSO2yKCyREUEFAtDAAAsWRyEp4oMBQCA0EDRhNMAovkMRn8pp5JSCGRCtmhKdSiLSEWjkfDEeiKlj7o9nq93sUgA)

## 1-1-7 函数类型

函数有输入和输出，都要考虑类型的把控

### 函数声明

看看下面简单的例子

```ts
function sum(a: number, b: number): number {
  return a + b;
}

// sum(1) - Expected 2 arguments, but got 1.
// sum(1, 2, 3) - Expected 2 arguments, but got 3.
```

参数数量需要严格一样

### 函数表达式

我们可以改写下上面的 `sum` 函数声明，用函数表达式的方式重新定义一下

```ts
let sum2 = function (a: number, b: number): number {
  return a + b;
};
```

不过就会发现一个问题，`sum2` 本身就没有定义类型了，我们给它也加上

```ts
let sum2: (a: number, b: number) => number = function (
  a: number,
  b: number
): number {
  return a + b;
};
```

这里的 `(a: number, b: number) => number` 左边是输入，右边是输出，和 `ES6` 的箭头函数不一样，不要混淆了

### 接口定义函数形状

下面改用接口的方式定义也是可以的

```ts
interface SumFuncShape {
  (a: number, b: number): number;
}

let sum3: SumFuncShape = function (a: number, b: number): number {
  return a + b;
};
```

### 可选参数

```ts
function aFunc(a: string, b?: string): string {
  if (b) return a + b;
  return a;
}
```

和接口里面定义可选的属性是一样的做法 `?:`。然后可选参数后面不能再加入其他参数了，只能放在最后面

### 默认值

和 `ES6` 的语法意义

```ts
function bFunc(a: string, b: string = 'default'): string {
  return a + b;
}
```

### 剩余参数

和 `ES6` 的语法意义

```ts
function cFunc(a: string, ...b: string[]): string {
  return a + b.join();
}
```

### 重载

重载的一个目的：函数可以在不同的参数数量或者类型的情况下，做出不同的处理。

我们先看一下一个简单的例子

```ts
function dFunc(a: string | number): string | number {
  if (typeof a === 'number') {
    return Number(a.toString().split('').reverse().join(''));
  } else {
    return a.split('').reverse().join('');
  }
}
```

不过有个问题，输入是 `string` 返回 `number` 或者 输入是 `number` 返回 `string` 的话，它是校验不了的，一样可以通过。我们需要优化下

```ts
function dFunc(a: string): string;
function dFunc(a: number): number;
function dFunc(a: string | number): string | number {
  if (typeof a === 'number') {
    return Number(a.toString().split('').reverse().join(''));
  } else {
    return a.split('').reverse().join('');
  }
}
```

重复定义了这个函数，最后才是真正的实现，最终能保证我们想要的结果

[demo](https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABAZxAWwBQEMBcizoBGApgE4A0iheBaJpAlDUWYgN4BQi3ipxUIUkiyIA1FQDcHAL4cOAenkp0GAIwMFS1JlWUATJQDMGjgBt+ytHrzZmdMpWr4WjRAF4AfM-ul3iUJCwCIi23vSOdvRMYaycPLz8gsJikjJyMGBQZMBYEMSIAMroAGLgEAUAFlgADvlxPKG04VSRZNFNZFKyZhbahnhFaKWQlTX5bv5lQUiNLhExjK2+9dx8AkKIIuKEXXIB0PDCwxChyFCkGQDmjgD8eGcXYJfRD1fsXDwwwCGEDAnryW2UniaySm12HH20yox1O5yu81eTz8AHIACbEHIgUxQFEveHIlb-MFbVLdKGHRAQWG4FAE66IAB0zKcSMuAG0ALr4x6Xd4gxIbUmERkAKzgGQwDAhFOCaJp93pPKuUllSHlZVmPnaLlVU0pGsgcN5iAAPgtlcjzR1lh9uF8QlAAJ61ODfERuT2IFE2vH8+I8UEbAByLmwjKgcAK9KljOQ1VMMCgGBReMZfAAbmRkMRY+LJamGNK7YhpIhiKYc-6A8ShXGE0mU2nM9ncwwxRKwE2NPFZNIgA)

## 1-1-8 类型断言

类型断言：手动指定一个值的类型

语法是 `值 as 类型 `

### 联合类型中使用

我们可以用类型断言，去断言值为联合类型中的一种类型，否则我们使用值的时候，只能用联合类型的公共属性和方法

下面这段代码会报错：

```ts
interface Cat {
  name: string;
  miaomiaomiao(): void;
}

interface Fish {
  name: string;
  huashui(): void;
}

function doAction(animal: Cat | Fish) {
  animal.miaomiaomiao();
}

// - Property 'miaomiaomiao' does not exist on type 'Cat | Fish'.
// - Property 'miaomiaomiao' does not exist on type 'Fish'.
```

我们简单调整下 `doAction` 函数

```ts
function doAction(animal: Cat | Fish) {
  (animal as Cat).miaomiaomiao();
}
```

不过这种方法其实不好，只是欺骗了一下 ts 编译器。运行时如果调用函数传入的参数是 Fish 就报错了

如下：

```ts
const fish: Fish = {
  name: 'fish',
  huashui() {},
};

doAction(fish);

// - animal.miaomiaomiao is not a function
```

我们也可以把某个值断言为具体的其他子类，比如：

```ts
class ApiError extends Error {
  code: number = 0;
}

class HttpError extends Error {
  statusCode: number = 200;
}

function isApiError(error: Error): boolean {
  if (typeof (error as ApiError).code === 'number') {
    return true;
  }
  return false;
}

let httpError: HttpError = {
  statusCode: 304,
  name: 'not found',
  message: 'not found',
};

console.log(isApiError(httpError)); // false
```

首先我们函数传入的参数是一个 `Error` 类型，那么 `ApiError` 和 `HttpError` 都可以作为参数传入。另外我们在判断是否存在 `code` 以及判断是否为数字的时候，如果是直接使用 `Error` 来判断的话， `ts` 会报错，因为 `Error` 类上面没有 `code` 属性，所以这里使用了断言，断言成了一个 `ApiError` 来进行判断。如果不是 `ApiError` 的话也没有问题，判断成了 `undefined` 返回 `false` ，正常运行

有一个更加简单的方法，我们可以去判断

```ts
if (error instanceof ApiError) {
  return true;
}
return false;
```

但是这里存在一个问题，可能 `HttpError` 和 `ApiError` 不是一个类，而是接口，那实际上通过 `instanceof` 判断的话会有问题

看看下面的例子

```ts
interface ApiError extends Error {
  code: number;
}

interface HttpError extends Error {
  statusCode: number;
}

// - 'ApiError' only refers to a type, but is being used as a value here.
```

嗯，报错了。

这个时候换回断言的写法，又恢复正常了。

### 断言为 `any`

看一段简单的代码

```ts
window.foo = 1;

// - Property 'foo' does not exist on type 'Window &amp; typeof globalThis'.
```

我们想在 `window` 上加一个全局的变量 `foo` 但是 `ts` 不允许，提示不存在这个属性。这个时候我们可以进行下面的操作

```ts
(window as any).foo = 1;
```

代码就正常运行了，因为 `any` 类型是可以调用任何属性和方法的，不会报错

但是我们大部分情况下，除非非常有把握，都不要断言为 `any` ，很有可能导致变异阶段 `ts` 发现不了问题，而在运行时程序出错。

### 把 `any` 对象断言为具体的类型

第三方库，或者别人遗留的，或者一些其他问题，可能某个值是 `any` 类型。我们最好的实践就是去进行断言处理

比如我们有这么一个函数：

```ts
function getCache(key: string): any {
  return (window as any).cache[key];
}
```

它返回的是一个 `any` 类型，那其实在我们获取到 `cache` 以后的继续处理，类型是没有保障的。我们可以使用断言处理：

```ts
const tom = getCache('tom') as Cat;
tom.miaomiaomiao();
```

不过这里也存在返回的对象不是 `Cat` 类的情况，也会报错。但是算是一种补救手段

我们有一个更好的方法来处理，最优解：查看 [泛型的例子 demo](https://www.typescriptlang.org/play?ssl=1&ssc=1&pln=14&pc=1#code/JYOwLgpgTgZghgYwgAgMJzMg3gKGf5EOAWwgC5kBnMKUAcwG48Djg4B7Vjr9gCgEoKAN3bAAJkwC+OGTACuIBGGDsQyOhDDoEACwgAeACoA+XgGsIATwrVaIOoOSHszfFE1yoa3gHdQY9h9kOEpgkEt+ADoERD0AbQtLAF0pGQRVamQwTmQAXnVNbT19dDBTAHJs4nL+ZCYqyJ4mtj5+JhwgA)

```ts
interface Cat {
  name: string;
  miaomiaomiao(): void;
}

function getCache<T>(key: string): T {
  return (window as any).cache[key];
}

const tom = getCache<Cat>('tom');
tom.miaomiaomiao();
```

[上面其他例子的 demo](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgMJzMg3gKGf5EOAWwgC5kBnMKUAcwG48Djg4B7Vjr9gCgEoKAN3bAAJkwC+OHKEixEKAGLBKAC2zN8RUhWq0QjLcjUBXOOtPABw0RJzScMUyARhg7EMjHsAgm48QXjgQYGI4ABsKdEwAH2QVdX5NAmRg0PCI5As0DH4AOh4itj5+KRkET2pkGFU1CkSNAF4Ugh1yZAByWvVOgBpjMwsza2SsZGlHAHop7z8Az14etTKZGeQECItKZF8AB2AAUSgodihkCAAPSBAxHePT89x11MqxDpBTYgAjaGQWgAMTHW01mm22yAAEmAwHsHmcLtcILd7icEc9ZqlqBhTJRUOx3hRPj8-i0AEwAoE4EEyOTQeBIXYHeHnK43O7IFmtfBvD5fX5QcqycD0xRQmFwtGspEozlS7lUMA4vEEvkkwUOGTOVzuTzIVT7I5S3jQR4UFmCZDfdjsCIQEIK4AwNJgACeewg7GdJvlOUNFvyvP+TRanWJAs6Y2MqSgEDApigXhopggTFS0lS6ydaVNCNA2Ncnud-qlUczmIIsfjieQydTxhpMbjCa88AilHrjjtmDUEpZFGhsK5LVwWKV8ZVhOQAGYAQAWAapdoUMPsTAwdguMT9YykSiUOB0Dqr9eb26dTU4SogSi2iD5CLsOi8A3M429oel1ZrWYAd1APi-vkG7sP8yAAIxMLw-63Owv7ZDsISugUIFgZBFRVHeD5Prw0EAXBCHZCAyHATa37agsXhHmA6AIGoEC8AA1hArp6DQ9CWkhCpVi2aQwYBhFIQUCCIPRADazGugAukK17VGAnBgdRtH0bwnQKcQkaETETAaYUJTFBwAgMEAA)

### 断言限制

如果 A 兼容 B，A 可以断言为 B，B 也可以断言为 A。看下下面的代码是没有报错的

```ts
interface Animal {
  name: string;
}
interface Cat {
  name: string;
  run(): void;
}

let tom: Cat = {
  name: 'Tom',
  run: () => {
    console.log('run');
  },
};
let animal: Animal = tom;
```

`ts` 是结构类型系统，类型之间的对比只会比较它们最终的结构，而会忽略它们定义时的关系。

`Cat` 包含了 `Animal` 中的所有属性，除此之外，它还有一个额外的方法 run。`ts` 并不关心 `Cat` 和 `Animal` 之间定义时是什么关系，而只会看它们最终的结构有什么关系。这里与 `Cat extends Animal` 是等价的：

```ts
interface Animal {
  name: string;
}
interface Cat extends Animal {
  run(): void;
}
```

那么也不难理解为什么 `Cat` 类型的 `tom` 可以赋值给 `Animal` 类型的 `animal` 了，就像面向对象编程中我们可以将子类的实例赋值给类型为父类的变量

`ts` 中的专业说法是，`Animal` 兼容 `Cat`

所以如果兼容的话他们也可以互相断言了 ，下面代码不会报错

```ts
function testAnimal(animal: Animal) {
  return animal as Cat;
}
function testCat(cat: Cat) {
  return cat as Animal;
}
```

- 允许 `animal as Cat` 是因为「父类可以被断言为子类」
- 允许 `cat as Animal` 是因为既然子类拥有父类的属性和方法，那么被断言为父类，获取父类的属性、调用父类的方法，就不会有任何问题，故「子类可以被断言为父类」

但是这里简化的父类子类的关系来表达类型的兼容性，而实际上 `ts` 在判断类型的兼容性时，比这种情况复杂很多

总之

- 若 `A` 兼容 `B` ，那么 `A` 能够被断言为 `B` ， `B` 也能被断言为 `A` 。
- 若 `B` 兼容 `A` ，那么 `A` 能够被断言为 `B` ， `B` 也能被断言为 `A` 。

所以

要使得 `A` 能够被断言为 `B` ，只需要 `A` 兼容 `B` 或 `B` 兼容 `A` 即可。也为了在类型断言时的安全考虑，毕竟毫无根据的断言是非常危险的

[demo 地址](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgIImAWzgG2QbwChkTkQ5MIAuZAZzClAHMBuQgX0NElkRQGE4YAsVLlKNeoxCtRJKAFcQACgCUNAG4B7YABM2nQjgjCwWzDUHCAvCNJkK1ZAHIAKuecAaOckUgaasjWAHwEyAhaILRaxgB0OFpMys5+zqrInOxsxsJwGNg4NOhYuEHIZphshDBKCGDAkeUQ9MUFynklhWj5uOlE9lAmClAgyO09eHC0yFaqBtW19Y2Q9FbKCEKWQn0+g2DDo+tCyFPdnXMcQA)

## 1-1-9 声明文件

## 1-1-10 内置对象

`js` 的很多内置对象，`ts` 已经帮我们做好定义了

比如 `Boolean` `Error` `Date` `RegExp`

另外 `ts` 也内置了 `Dom` 相关的类型

比如 `Document` 、 `HTMLElement` 、 `Event` 、 `NodeList`

我们可以直接拿来定义值的类型

比如我们使用

```ts
Math.pow(1, '2');

// - Argument of type 'string' is not assignable to parameter of type 'number'.
```

`ts` 已经内置了它的定义，如

> (method) Math.pow(x: number, y: number): number
> Returns the value of a base expression taken to a specified power.
> @paramx — The base value of the expression.
> @paramy — The exponent value of the expression.

类似于

```ts
interface Math {
  /**
   * Returns the value of a base expression taken to a specified power.
   * @param x The base value of the expression.
   * @param y The exponent value of the expression.
   */
  pow(x: number, y: number): number;
}
```

又比如：

```ts
document.addEventListener('click', function (e) {
  console.log(e.targetCurrent);
});

// - Property 'targetCurrent' does not exist on type 'MouseEvent'.
```

`e` 被推断为 `MouseEvent` 但是它上面没有 `targetCurrent` 属性

它的类型定义是这样的

```ts
interface Document
  extends Node,
    GlobalEventHandlers,
    NodeSelector,
    DocumentEvent {
  addEventListener(
    type: string,
    listener: (ev: MouseEvent) => any,
    useCapture?: boolean
  ): void;
}

// 第一个参数是 字符串类型的 type 字段，第二个是一个函数，它接收一个类型为 MouseEvent 的 `ev` 参数，返回 any 类型，第三个参数是可选的一个 boolean 类型的 useCapture 参数
```

如果要写 `node.js` 的话，可以安装下面的库，提供了一些类型声明

```
npm install @types/node --save-dev
```

[demo 地址](https://www.typescriptlang.org/play?#code/LIQwLgFgdADg9gdwBQEYA0ByATBglAbgChCATOAYwFcBbAUwDswoQSSBRANwbABkBLAM5gGtAE5IM5ADZ9yAawxoABADNK9cmD5x6SWriUBvQktNLyOgXCm0oUuAHM9UMCFEPaYAMKVRo7gSEAL4EQA)

# 1-2 进阶

## 1-2-1 类型别名

常用语联合类型，给类型改个名

```ts
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;

function getName(n: NameOrResolver): Name {
  if (typeof n === 'string') return n;
  else return n();
}
```

[demo 地址](https://www.typescriptlang.org/play?ssl=1&ssc=1&pln=8&pc=2#code/C4TwDgpgBAcghgW2gXigZ2AJwJYDsDmA3AFCiSyIQBKEaA9gDYBuEmUqAFAJTsB86WPEVLho8JAHlMNes1bsKSKAB9F1WoxaYSxAGYBXXAGNg2Orij4IwcRA64AXGqkzNrLk9tQA3sSj+obF0oDjIIOmCLZGioAHIMHAJYnkxrfUwLXBIAqAgGNGhU4HTM7hIAXyA)

## 1-2-2 字符串字面类型

使用别名来创建字符串字面类型

```ts
type EventNames = 'click' | 'scroll' | 'mousemove';

function handleEvent(ele: Element, event: EventNames) {
  console.log(ele, event);
}

handleEvent(document.body, 'click');
handleEvent(document.body, 'dbclick');
// - Argument of type '"dbclick"' is not assignable to parameter of type 'EventNames'.
```

`dbclick` 不在 `EventNames` 定义的字面类型里面，所以会报错

[demo](https://www.typescriptlang.org/play?#code/C4TwDgpgBAogbhAdsAcgQwLYQM5QLxQDkAxgDYCWxA1oVAD5HbEBOA9qabQ4RqwK7YIvBIQDcAKHEAzPomLByrRFAAWaRABNSEeEmAAKCNoBcsbVmQAaKBATJTu5OizYAlFADe4qD6jEl2OwQAHSkrADmhtrWtnquEgC+kmqa2o4GGqzEfBbAwQBGrBog1iQU1ISu4ilaOnYZWTl6BUUlRBr5ZJQ0rkA)

## 1-2-3 元组

数组一般情况下是相同类型的值的集合，而元组是不同类型的值的集合，看看下面的 `demo`

```ts
let aTunple: [string, number, number, boolean] = ['cody', 123, 4, true];
```

另外发现

```ts
aTunple.push(1);
aTunple.push(new Boolean(1));

// - Argument of type 'Boolean' is not assignable to parameter of type 'string | number | boolean'.
// - Type 'Boolean' is not assignable to type 'true'.
```

不能加入 元组 中定义的类型集合的其他类型值

[demo 地址](https://www.typescriptlang.org/play?ssl=1&ssc=1&pln=8&pc=22#code/DYUwLgBAhgKgrgOwA6gFwQNoGcwCcCWCA5gDQQJwC2ARiLmRTXWdQPauhQIC6EAvJgDkAY1YATAJ6CyARgBMAZjIAWMnjghuAbgBQO2IhQgAdEjhYAFgAoZASl0B6B9HjJQp89YQgA7hABC7JwINrb2egZuJpb4AGZgVrZ6oghYHCbArERWkUb2QA)

## 1-2-4 枚举

枚举一般是用在值在一定范围内的情况，比如下面的例子，一周七天只有限定的几个值

```ts
enum Days {
  Sun,
  Mon,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
}
```

枚举值是从 `0` 开始的，枚举值到枚举名也会有映射关系，我们看看 `ts` 转 `js` 是怎样的：

```js
'use strict';
var Days;
(function (Days) {
  Days[(Days['Sun'] = 0)] = 'Sun';
  Days[(Days['Mon'] = 1)] = 'Mon';
  Days[(Days['Tue'] = 2)] = 'Tue';
  Days[(Days['Wed'] = 3)] = 'Wed';
  Days[(Days['Thu'] = 4)] = 'Thu';
  Days[(Days['Fri'] = 5)] = 'Fri';
  Days[(Days['Sat'] = 6)] = 'Sat';
})(Days || (Days = {}));
```

简单测试一下：

```ts
console.log(Days.Sun === 0); // true
console.log(Days.Sat === 6); // true
console.log(Days[6] === 'Sat'); // true
```

另外我们可以给枚举值赋值，没有赋值的枚举值就会跟着上一个枚举值递增。看下具体的例子就知道什么意思了

```ts
enum Days2 {
  Sun = 7,
  Mon = 1,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
}
```

会被转成

```js
var Days2;
(function (Days2) {
  Days2[(Days2['Sun'] = 7)] = 'Sun';
  Days2[(Days2['Mon'] = 1)] = 'Mon';
  Days2[(Days2['Tue'] = 2)] = 'Tue';
  Days2[(Days2['Wed'] = 3)] = 'Wed';
  Days2[(Days2['Thu'] = 4)] = 'Thu';
  Days2[(Days2['Fri'] = 5)] = 'Fri';
  Days2[(Days2['Sat'] = 6)] = 'Sat';
})(Days2 || (Days2 = {}));
```

另外也有可能出现覆盖的情况，但是 `ts` 不会报错。看下第三个例子：

```ts
enum Days3 {
  Sun = 3,
  Mon = 1,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
}
```

编译后的结果

```js
(function (Days3) {
  Days3[(Days3['Sun'] = 3)] = 'Sun';
  Days3[(Days3['Mon'] = 1)] = 'Mon';
  Days3[(Days3['Tue'] = 2)] = 'Tue';
  Days3[(Days3['Wed'] = 3)] = 'Wed';
  Days3[(Days3['Thu'] = 4)] = 'Thu';
  Days3[(Days3['Fri'] = 5)] = 'Fri';
  Days3[(Days3['Sat'] = 6)] = 'Sat';
})(Days3 || (Days3 = {}));
```

`Days3[3]` 原本是 `Sun`，后面被 `Wed` 覆盖了。这种情况最好自己规避

[demo 地址](https://www.typescriptlang.org/play?#code/KYOwrgtgBAIghgTwM5QN4CgpagZTCAGigFkB7QqAFTGCIHVgATIygCzCIDEAnASyJxwALugC+6AMbkkpADbAAdLNIBzABTxkCvCCgBeA1AAMASgDck6XMXL1mpNuH7DANnPpLIGfKWqNiJABtFwBdZz0oAHJBIUiTD1BIWACAJjRMbB19KAB2IjJdCIBGFhp6JhZ2Lj4BYTEE8Gh7AGZ07Fx8bOb88mySqjKoBmYqKqgeflw60SA)

## 1-2-5 类

`ts` 中对类新增了三个修饰符

- `public`: 默认属性和方法都是这个修饰符，代表共有的，外部都可以访问到
- `private`: 代表这个属性和方法是私有的，只有这个类可以访问
- `protected`: 和 `private` 类似，但是子类可以访问

看一下简单的例子

```ts
class Animal {
  private name;
  constructor(name: string) {
    this.name = name;
  }
}

const cat = new Animal('hello');
console.log(cat.name);

// - Property 'name' is private and only accessible within class 'Animal'.
```

另外可以发现子类继承也是不行的

```ts
class Cat extends Animal {
  constructor(name: string) {
    super(name);
    console.log(this.name);
  }
}

// - Property 'name' is private and only accessible within class 'Animal'.
```

不过我们可以改成 `protected`修复符，上面的报错就没有了

不过实例去访问 `name` 属性还是一样会报错

```
- Property 'name' is protected and only accessible within class 'Animal' and its subclasses.
```

只有 `Animal` 和它的子类，这里就是 `Cat` 类，可以访问这个属性

另外我们看看如果把 `Animal` 的 构造函数设置为 `private` 也会报错

```
- Cannot extend a class 'Animal'. Class constructor is marked as private.
- Constructor of class 'Animal' is private and only accessible within the class declaration.
```

无法继承。

如果把 `Animal` 的构造函数设置为 `protected` 的话，无法实例化

```
- Constructor of class 'Animal' is protected and only accessible within the class declaration.
```

但是如果是实例话 `Cat` 类的话还是可以的，`Cat` 有访问父类为 `protected` 的构造函数。

另外可以发现我们对属性的修饰符是单独拎出来写的，可以进行下面的简化

比如

```ts
class Animal {
  protected name;
  protected constructor(name: string) {
    this.name = name;
  }
}
```

和下面是等价的

```ts
class Animal {
  protected constructor(protected name: string) {}
}
```

另外还有一个修饰符 `readonly`，它需要在其他修饰符后面。我们再调整下上面的例子

```ts
class Animal {
  protected constructor(protected readonly name: string) {}
}

const cat = new Cat('hello');
cat.name = 'haha';

// - Property 'name' is protected and only accessible within class 'Animal' and its subclasses.
// - Cannot assign to 'name' because it is a read-only property.

// 如果 readonly 写在了 protected 前面的话，也会有下面的报错：'protected' modifier must precede 'readonly' modifier.
```

上面关于类的时候，代码在 [demo 地址](https://www.typescriptlang.org/play?#code/MYGwhgzhAECCB2BLAtmE0DeAoavoHp9oAHAJ0QDcwAXAU2njGVoG4c8yB7O4OgE2jBO8CNVIBXXp1IAKLj37RStMH2EgAngya0AXNFHl4AcwCUmdrgC+WG1lCQYAYRrRaADzrw+MBCjTYeILChpLU0jKMzLqGiCbmgUF4EOLEtLJRtKZsSXhCIpwgtAB0IJzGMtQAFogQxZnZltA2dvmigq4AvAy0AO7QLtQyAORVtCBlw43ANPU60N2jYFVgw2yEwQVFpeUyM9RzzNlAA)

### 抽象类

`abstract` 定义抽象类，它不能被实例化

```ts
abstract class Animal {
  constructor(public name: string) {
    console.log(name);
  }
}
const cat = new Animal('cat');
// - Cannot create an instance of an abstract class.
```

我们新建一个类继承这个抽象类。继承的子类必须实现抽象类中的抽象方法

```ts
abstract class Animal {
  constructor(public name: string) {
    console.log(name);
  }
  abstract say(): void;
}
class Cat extends Animal {}
const cat = new Cat('cat');

// - Non-abstract class 'Cat' does not implement inherited abstract member 'say' from class 'Animal'.
```

我们实现一下这个方法，如今可以正常运行没有报错了

```ts
abstract class Animal {
  constructor(public name: string) {
    console.log(name);
  }
  abstract say(): void;
}
class Cat extends Animal {
  say() {
    console.log(this.name);
  }
}
const cat = new Cat('cat');
cat.say();
```

可以看下最终的编译结果， `Animal` 抽象类其实也是真实存在的

```js
'use strict';
class Animal {
  constructor(name) {
    this.name = name;
    console.log(name);
  }
}
class Cat extends Animal {
  say() {
    console.log(this.name);
  }
}
const cat = new Cat('cat');
cat.say();
```

[demo 地址](https://www.typescriptlang.org/play?#code/IYIwzgLgTsDGEAJYBthjAgggOwJYFthkEBvAKAUqQHttIoBXeaqACgAcGRldYFtg+AKYAuBPVzYA5gEpSFKoti0w1ZEIB0yalNYDhMgNwLKAXxMJQ9OIjDAAnqxliAbtVwATY+bJkUaDABhYEQhAA8IIWwPDBwCInlFO0c5ckUlFTVNbV0IAAtcMA19ISMLcx9lOkRYEIQAXn4hAHcEYIhWAHJaiE6yno1kp0MgA)

## 1-2-6 类与接口

实现 `implements` 是面向对象中的一个概念。一般类只能继承一个类

但是日常开发中经常不同类之间是有相同特征的，把这一部分抽取出来成为一个接口，类通过 `implements` 实现它们的方法，获取更大的灵活度

举个生活中的例子，我们有一个门的类，防盗门继承门，防盗门有警铃的功能，另外又有一个警车的类，它也有警铃的功能，于是我们可以把这个功能抽取出来成为一个接口，让防盗门和警车去实现它就好了

我们代码实现下上面提到的情况

```ts
interface Alarm {
  alarm(): void;
}

class Car {}
class AlarmCar extends Car implements Alarm {
  alarm() {
    console.log('AlarmCar alarm!!!');
  }
}

class Door {}
class AlarmDoor extends Door implements Alarm {
  alarm() {
    console.log('AlarmDoor alarm!!!');
  }
}
```

另外我们也可以实现多个接口，比如车还有车灯

```ts
interface Light {
  lightOn(): void;
  lightOff(): void;
}
class Car {}
class AlarmCar extends Car implements Alarm, Light {
  alarm() {
    console.log('AlarmCar alarm!!!');
  }
  lightOff() {}
  lightOn() {}
}
```

### 接口继承接口

另外接口也是可以继承其他接口的，所以我们的类也需要实现接口父类的方法

```ts
interface blingbling {
  blingbling(): void;
}

interface Light extends blingbling {
  lightOn(): void;
  lightOff(): void;
}

class Car {}
class AlarmCar extends Car implements Alarm, Light {
  alarm() {
    console.log('AlarmCar alarm!!!');
  }
  lightOff() {}
  lightOn() {}
  blingbling() {}
}
```

上面的例子可以在这里查看： [demo 地址](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgIIBs5QLbIN4BQyxycmOAFAJQBcyAbgPbAAmA3AQL4EGiSyIUAI3SgA5iPH4iJSSAmj51Ok1YduvcNHhJkAGWBiAFmGQQAHpBAsAzsjkKphEslHGwAeRDKGzdjOI3Ew8YGB9Vfw0ETBs7AGEsfGRuaLhYtHJsBKgzSwhreMTgbAAHdAhsfLA7DCxsABp9QxNiZxIyOuokhEYQG0ZygDp0RjEKAHJanGzSTIBCBfGqZIDXZs9QrrxuFyDPb2Xt1YcHLe4omLsAEUZGHLwV1PSp7Bu73KtbZDec4rKKqo1TLSFwdSiHZA9PoDCDDUYTF4-WZ1BZzJYrThAA)

### 接口继承类

接口也可以继承类

我们先看看下面的案例

```ts
class Point {
  constructor(public x: number, public y: number) {}
}

interface Point3D extends Point {
  z: number;
}

let point: Point3D = { x: 1, y: 2, z: 3 };
```

实际上我们声明一个类的时候，也会产生这个类的类型。所以我们既可以用 `Point` 创建一个实例，也可以把它当做一个类型，如 `const point: Point = new Point(1, 2);`

其实等价于下面的写法：

```ts
class Point {
  constructor(public x: number, public y: number) {}
}
interface PointInstanceType {
  x: number;
  y: number;
}
const point: PointInstanceType = new Point(1, 2);
```

我们大概也能理解

```ts
interface Point3D extends Point {
  z: number;
}
```

其实等价于

```ts
interface Point3D extends PointInstanceType {
  z: number;
}
```

所以接口继承类，实际上是继承了类的实例的类型，等价于继承了另外一个接口

另外我们发现是不继承 构造函数的，也不会继承静态属性和静态方法。因为我们类的实例，其实也是不包含这些的，很好理解

[demo 地址](https://www.typescriptlang.org/play?#code/MYGwhgzhAEAKD2BLAdgF2gbwFDV9Y8yEqATgK7CrwkAUADmQEYiLDQAeAXNMmQLaMApiQA00Bs1bQAnt14DhASkw48AXywasKVMIBmYYILhI0ASSKowyIwBVpdY9jwc5-ISQDcq3LJ7vhby0dfUNjBB0AZgARaEF2XWQAExgI80trOwcnH2gALzcFL00sLBBBdDpTVEik7jSa2IBeTFdoAEYxPwAmMQLoSOgtAktxavrqi2JMwXtHaBbkQQB3Ex0aTuhuxU8gA)

## 1-2-7 泛型

泛型指的是定义函数，接口或者类的时候，不预先指定好类型，在实际用的时候才去指定类型

先看一个简单的例子

```ts
function repeat(length: number, value: any): any[] {
  const result = [];
  for (let index = 0; index < length; index++) {
    result.push(value);
  }
  return result;
}

console.log(repeat(5, 'cody')); // ["cody", "cody", "cody", "cody", "cody"]
```

但是你可以发现，返回的值是 `any[]`，我们不能保证返回的数组的项和传入的 `value` 的类型一致。进行下面的优化：

```ts
function repeat2<T>(length: number, value: T): T[] {
  const result = [];
  for (let index = 0; index < length; index++) {
    result.push(value);
  }
  return result;
}
console.log(repeat2(2, 'cody')); // ["cody", "cody"]
```

可以看到上面的例子，在函数名 `repeat2` 后面加了一个 `<T>`，它代表可以输入任意类型的值，但是使用的时候一旦制定了 `T` 类型，后面的 `value` 参数和 返回的 `T[]` 数组都是这种类型了，解决了我们上面提到的问题

我们稍微调整下 `push` 的值，会发现报错了。这个如果在原来的 `repeat` 函数是不会报错的，因为它并不校验。

```
result.push(Number(value));

// - Type 'number[]' is not assignable to type 'T[]'.
// - Type 'number' is not assignable to type 'T'.
// - 'T' could be instantiated with an arbitrary type which could be unrelated to 'number'.
```

我们也可以指定多个泛型，比如

```ts
function swap<U, T>(arr: [U, T]): [T, U] {
  return [arr[1], arr[0]];
}
```

### 泛型约束

泛型不能任意调取属性或者方法，因为不一定存在，不过我们可以进行约束

比如下面的例子：

```ts
function needLength<T>(arg: T): number {
  return arg.length;
}

// 这样是会报错的，我们改进下

interface LengthWise {
  length: number;
}
function needLength<T extends LengthWise>(arg: T): number {
  return arg.length;
}
```

再看一个例子：

```ts
function copyFields<T extends S, S>(target: T, source: S): T {
  for (let field in source) {
    target[field] = (source as T)[field];
  }
  return target;
}
let x = { a: 1, b: 2, c: 3, d: 4 };
console.log(copyFields(x, { b: 10, d: 20 }));
```

如果有在 `source` 中出现 `target` 不存在的字段，就会报错

### 泛型接口

```ts
interface CreateArrayFunc {
  <T>(length: number, value: T): Array<T>;
}

let arrayFunc: CreateArrayFunc = function <T>(
  length: number,
  value: T
): Array<T> {
  const arr: T[] = [];
  for (let index = 0; index < length; index += 1) {
    arr.push(value);
  }
  return arr;
};

console.log(arrayFunc(2, 'cody'));
```

### 泛型类

看下例子就好了

```ts
class MulType<T> {
  constructor(public val: T) {}
  say(): T {
    return this.val;
  }
}

const numberType = new MulType(40);
console.log(numberType.say());

const numberType2 = new MulType('123');
console.log(numberType2.say());
```

[demo](https://www.typescriptlang.org/play?ssl=56&ssc=34&pln=46&pc=1#code/GYVwdgxgLglg9mABAJwKYAdUEMoAoA2qYA5lABYBciYIAtgEarIA0iAblviKlVmAJ4BKXgIDaAXUQBvAFCJ5iCAgDOUFKmUh8agLyIJAbjkLgcZIgKo1MMABNUAD0R6ADAcQ37TgDyJCJcndPRwBqEMFpYwUFNE1tADp0EGUyXA4uVEEjaIBfKPUoEGQkWK0oIzyZJTBlOEJ4-DhiXDRMHFwAVlYAciVbfm7BLMQAehH9ACI+-gnWKbh+2cR5xbnppZWZ8RkZUEhYBHU2qAAmbwAVAD5LAMpqOkYWdk5uKnPhRHOJSOjq1XU4rp9OJsiYzBZCNY7I5nIg3B5oT4-ERSGQgoiwhFZNFoqUEkkUmkXplQfI8rirEUShoyhUqio6qgGk0WhhsKdcCcetNBsMxpN1msFlsdvy8VBEslUgA5B5MIkZIZGXbgaDwJDKADuWHQ3gAqqwrrgsMhkFRRAbPuIPqJzqw9ZJsTFKcV9CbkKIAIziVju0QucQgmSVGxQJjALAQVCIAAyKPIAHUYMpo075P5UVQaAwmHSVft1dRUKhbHHbhdEI4w3ZlLH42QkynribiG8PtnHj9nYVXS2GvW82Bi6X67hup6TgBmQbKvZqw5KdD8ABiMFQ+FsygrVaIm8QAGVWPvrlAW1Y3qxakUo1R9x9zl35KZzJY1MA1xuEYgr8go1j8tE-LnPwmCIN0ACiDhQMgkZQN4ADWqD8HAwCfJe0E2MQlzdIofBgHAaiMIgyQlogUBwAiXhkSB0bdMu3TxABCinsgxBWKI77rrYkh6LgP5RogWC1u8HEftxpKIOS3ZUmRZ7lMGMiQogTh6FIglUJ6rD0FQXKKFQk6sLYVAACySUYfyMsyzSLiuYnKLgDisGp2mIJ6LiGTpLiSUqOyhuGkbRgAwmgOCoAAgqaWArqqj6IBc1wZuQWZyk86SvJ8HwRTB-DxXmSnulFy6qlQwXsuFkXRZAsJzgcSAVnoqjIJhCX1slOapcSbZUFlUXxbFfxqO6bzfHoEj5M+EJWJRMKuOiVG+IlaLTU4IR6J6WKCaakqEmlmSSfkaA9kg7p5hZ9SNM0BWVRAnLcsKvI7BA+BCbWACyWjAZgfVpooKjQSA0BmLgST0PgMAQM8+BtpE+RSfIyhRbgwgPj9FJHWRZDJvE6QSXklQDfc7WfdGehDpqiDvfgxO4MZLhZPSNSWRduAdkwxPxAj-BI4Ij1-YTjzEycsJkxTH00WOE7TvTZ1MszrPIILHOI0MMhAA)

## 声明合并

如果定义了两个相同的接口，类或者函数，他们会合并起来

### 函数的合并

这是我们之前写过的例子，重载多种类型的函数

```ts
function dFunc(a: string): string;
function dFunc(a: number): number;
function dFunc(a: string | number): string | number {
  if (typeof a === 'number') {
    return Number(a.toString().split('').reverse().join(''));
  } else {
    return a.split('').reverse().join('');
  }
}
```

### 接口合并

```ts
interface Miaomiao {
  a: number;
}

interface Miaomiao {
  b: number;
}

const t: Miaomiao = {
  a: 1,
  b: 2,
};
```

### 类合并

和接口合并基本一样

[demo 地址](https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABAEwGLggCgIYC5EDOUATjGAOYCU+RpFA3AFCiSwIrqQ75ggC2AIwCmxaol6CRTFtHhI0GboRJlyiAD7j+w0TRUUNWycUQBvRokuIYwRJigBPAA5C4t7IgC83xAHIJOr6UZhZWYcRCUCDESABy2iI4AHRQcADK+uSYlEkETgA2MFCYvkFJEQBuIgRC2UkAVnBkJUGUTGEAvohC+TUhYeGR0UjYuQVFLTmV1bU5jc2lbaGWHYyrjGRQIsDYEEKIALIw2HB8x3D9VnhGOgA0a4wbYFvEO3uH52cnl5YCPAnEZaIAD0wMQ11oqnu6wgCCIiD4+COJy+F08P3B+AATAAGe5hP6IAAseIeQA)
