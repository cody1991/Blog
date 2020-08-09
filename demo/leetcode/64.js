/**
 * @param {number[][]} grid
 * @return {number}
 */
var minPathSum = function (grid) {
  for (let i = 0; i < grid.length; i++) {
    const rows = grid[i];
    for (let j = 0; j < rows.length; j++) {
      const cur = rows[j];
      if (i === 0) {
        if (j === 0) {
          grid[0][0] = cur;
        } else {
          grid[i][j] = grid[i][j - 1] + cur;
        }
      } else {
        if (j === 0) {
          grid[i][j] = grid[i - 1][j] + cur;
        } else {
          grid[i][j] = Math.min(grid[i - 1][j], grid[i][j - 1]) + cur;
        }
      }
    }
  }

  return grid[grid.length - 1][grid[grid.length - 1].length - 1];
};

console.log(
  minPathSum([
    [1, 2],
    [5, 6],
    [1, 1],
  ])
);
