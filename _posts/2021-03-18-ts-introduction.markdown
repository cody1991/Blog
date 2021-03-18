---
layout: post
title: TypeScript入门手册
tags: [typescript]
---

# 1 - 简介

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

```ts
npm install @types/node --save-dev
```

[demo 地址](https://www.typescriptlang.org/play?#code/LIQwLgFgdADg9gdwBQEYA0ByATBglAbgChCATOAYwFcBbAUwDswoQSSBRANwbABkBLAM5gGtAE5IM5ADZ9yAawxoABADNK9cmD5x6SWriUBvQktNLyOgXCm0oUuAHM9UMCFEPaYAMKVRo7gSEAL4EQA)
