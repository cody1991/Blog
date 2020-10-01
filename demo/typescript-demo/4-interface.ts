// 在面向对象语言中，接口（Interfaces）是一个很重要的概念，它是对行为的抽象，而具体如何行动需要由类（classes）去实现（implement）

interface Person {
  readonly name: string;
  age?: number;
  [propName: string]: string | number;
}

let tom: Person = {
  name: 'Tom',
  age: 25,
  sex: 'male',
};

// 定义的变量比接口少了一些属性是不允许的：
// Property 'age' is missing in type '{ name: string; }' but required in type 'Person'.

// 多一些属性也是不允许的：
// Object literal may only specify known properties, and 'sex' does not exist in type 'Person'.

// 有时我们希望不要完全匹配一个形状，那么可以用可选属性：

// 有时我们希望不要完全匹配一个形状，那么可以用可选属性：age?: number;

// 有时候我们希望一个接口允许有任意的属性，可以使用如下方式：
// [propName: string]: any;
// [propName: string] 定义了任意属性取 string 类型的值

// 一旦定义了任意属性，那么确定属性和可选属性的类型都必须是它的类型的子集
// 如果 [propName: string]: string;
// Property 'age' is incompatible with index signature.
// Type 'number' is not assignable to type 'string'.

// 一些字段只能在创建的时候被赋值，那么可以用 readonly 定义只读属性：
// 只读的约束存在于第一次给对象赋值的时候，而不是第一次给只读属性赋值的时候
