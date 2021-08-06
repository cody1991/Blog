/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  const map = nums.reduce((res, cur, index) => {
    res[cur] = index;
    return res;
  }, {});

  for (let index = 0; index < nums.length; index++) {
    const cur = nums[index];
    const targetMap = map[target - cur];
    if (targetMap && targetMap !== index) {
      return [index, targetMap];
    }
  }
};

const nums = [3, 3],
  target = 6;

console.log(twoSum(nums, target));
