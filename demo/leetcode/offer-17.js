/**
 * @param {number} n
 * @return {number[]}
 */
var printNumbers = function (n) {
  let count = 1;
  const res = [];

  while (count < Math.pow(10, n)) {
    res.push(count++);
  }
  return res;
};

console.log(printNumbers(1));
