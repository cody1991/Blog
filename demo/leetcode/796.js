/**
 * @param {string} A
 * @param {string} B
 * @return {boolean}
 */
var rotateString = function (A, B) {
  return A.length === B.length && (A + A).slice(0, -1).indexOf(B) >= 0;
};

console.log(rotateString("abcde", "cdeab"));
