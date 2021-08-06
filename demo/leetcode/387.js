/**
 * @param {string} s
 * @return {number}
 */
var firstUniqChar = function (s) {
  const map = {};
  for (let index = 0; index < s.length; index += 1) {
    const c = s[index];
    if (map[c] === undefined) map[c] = index;
    else map[c] = -1;
  }
  let result = Infinity;
  let flag = 0;
  for (let key in map) {
    if (map[key] != -1) {
      result = Math.min(result, map[key]);
      flag = 1;
    }
  }
  return flag ? result : -1;
};

console.log(firstUniqChar("cc"));
