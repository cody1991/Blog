/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLastWord = function (s) {
  let count = 0;
  let flag = false;
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s[i];
    if (c !== " ") flag = true;
    if (flag && c === " ") break;
    if (flag) {
      count += 1;
    }
  }
  return count;
};

console.log(lengthOfLastWord("Hello World "));
