/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function (nums) {
  if (nums.length === 0) return 0;
  for (let i = 1; i < nums.length; i += 1) {
    if (i == 1 && nums[i] < nums[i - 1]) {
      nums[i] = nums[i - 1];
    } else if (i > 1) {
      nums[i] = Math.max(nums[i - 2] + nums[i], nums[i - 1]);
    }
  }

  return nums[nums.length - 1];
};

console.log(rob([1, 2, 3, 1]));
