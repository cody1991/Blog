// 在任意值上访问任何属性都是允许的：
var _a, _b, _c, _d, _e;
var anyThing = 'hello';
console.log(anyThing === null || anyThing === void 0 ? void 0 : anyThing.myName);
console.log((_a = anyThing === null || anyThing === void 0 ? void 0 : anyThing.myName) === null || _a === void 0 ? void 0 : _a.firstName);
// 也允许调用任何方法：
(_b = anyThing === null || anyThing === void 0 ? void 0 : anyThing.setName) === null || _b === void 0 ? void 0 : _b.call(anyThing, 'Jerry');
(_d = (_c = anyThing === null || anyThing === void 0 ? void 0 : anyThing.setName) === null || _c === void 0 ? void 0 : _c.call(anyThing, 'Jerry')) === null || _d === void 0 ? void 0 : _d.sayHello();
(_e = anyThing === null || anyThing === void 0 ? void 0 : anyThing.myName) === null || _e === void 0 ? void 0 : _e.setFirstName('Cat');
// 变量如果在声明的时候，未指定其类型，那么它会被识别为任意值类型：
