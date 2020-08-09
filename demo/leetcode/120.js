/**
 * @param {number[][]} triangle
 * @return {number}
 */
var minimumTotal = function (triangle) {
  const dp = [];
  dp[0] = [];
  dp[0][0] = triangle[0][0];

  for (let i = 1; i < triangle.length; i += 1) {
    const rows = triangle[i];
    dp[i] = [];
    for (let j = 0; j < rows.length; j += 1) {
      const cur = rows[j];
      if (j === 0) {
        dp[i][j] = dp[i - 1][0] + cur;
      } else if (i === j) {
        dp[i][j] = dp[i - 1][j - 1] + cur;
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j]) + cur;
      }
    }
  }
  return Math.min(...dp[dp.length - 1]);
};

console.log(minimumTotal([[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]));
