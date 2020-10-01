// 在任意值上访问任何属性都是允许的：

let anyThing: any = 'hello';
console.log(anyThing?.myName);
console.log(anyThing?.myName?.firstName);

// 也允许调用任何方法：

anyThing?.setName?.('Jerry');
anyThing?.setName?.('Jerry')?.sayHello();

anyThing?.myName?.setFirstName('Cat');

// 变量如果在声明的时候，未指定其类型，那么它会被识别为任意值类型：
