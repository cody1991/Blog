/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function (strs) {
  if (!strs || strs.length === 0) return "";
  let res = strs[0];

  for (let index = 1; index < strs.length; index++) {
    const str = strs[index];

    res = prefix(res, str);
  }
  return res;
};

function prefix(res, str) {
  const resLen = res.length;
  const strLen = str.length;

  if (resLen > strLen) {
    [res, str] = [str, res];
  }

  while (res.length > 0) {
    if (str.indexOf(res) === 0) return res;
    res = res.slice(0, res.length - 1);
  }

  return res;
}

console.log(longestCommonPrefix(["flower", "flow", "flight"]));
