/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
  if (numRows === 1) return s;
  const arr = Array(numRows).fill("");

  let index = 0;
  let up = true;
  for (let i = 0; i < s.length; i++) {
    const cur = s[i];

    arr[index] += cur;

    if (up && index === numRows - 1) {
      up = false;
      index--;
    } else if (!up && index === 0) {
      up = true;
      index++;
    } else if (up) {
      index++;
    } else {
      index--;
    }
  }

  return arr.join("");
};
const s = "AB",
  numRows = 1;

console.log(convert(s, numRows));
