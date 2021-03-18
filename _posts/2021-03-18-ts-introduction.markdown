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
