/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function (nums) {
  let result = nums[0];
  let dp = 0;

  for (let index = 0; index < nums.length; index++) {
    const cur = nums[index];
    dp = Math.max(cur, dp + cur);
    result = Math.max(dp, result);
  }

  return result;
};

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
