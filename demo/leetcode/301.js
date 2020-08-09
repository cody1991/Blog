/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function (s) {
  const len = s.length;
  for (let i = 0; i < len / 2; i++) {
    [s[i], s[len - 1 - i]] = [s[len - 1 - i], s[i]];
  }
  return s;
};

console.log(reverseString(["h", "e", "l", "l"]));
