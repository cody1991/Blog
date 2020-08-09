/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function (s) {
  s = s.toLocaleLowerCase().replace(/[^a-zA-Z0-9]/g, "");
  let result = true;

  for (let i = 0; i < s.length / 2; i++) {
    const left = s[i];
    const right = s[s.length - i - 1];
    if (left !== right) {
      result = false;
      break;
    }
  }
  return result;
};

console.log(isPalindrome("A man, a plan, a canal: Panama"));
