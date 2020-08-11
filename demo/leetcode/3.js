/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  const map = {};
  let max = 0;

  for (let left = 0, right = 0; right < s.length; right += 1) {
    const c = s[right];

    if (map[c] !== undefined) {
      left = Math.max(left, map[c] + 1);
    }

    map[c] = right;
    max = Math.max(max, right - left + 1);

    console.log(max, left, right);
  }

  return max;
};

console.log(lengthOfLongestSubstring('abba'));
