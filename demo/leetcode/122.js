/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  if (prices < 2) return 0;
  let sum = 0;
  for (let index = 0; index < prices.length - 1; index += 1) {
    const cur = prices[index];
    const next = prices[index + 1];
    if (next > cur) sum += next - cur;
  }
  return sum;
};

console.log(maxProfit([7, 1, 5, 3, 6, 4]));
