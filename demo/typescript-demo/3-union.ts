let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
myFavoriteNumber = 7;

function getLength(something: string | number): number {
  // length 不是 string 和 number 的共有属性，所以会报错
  return something.length;
}
