/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  nums = nums.sort((a, b) => a - b);
  const res = [];

  let pre = undefined;

  for (let index = 0; index < nums.length - 2; index++) {
    const cur = nums[index];

    if (cur === pre) {
      continue;
    }
    pre = cur;

    let leftIndex = index + 1;
    let rightIndex = nums.length - 1;

    while (leftIndex < rightIndex) {
      let left = nums[leftIndex];
      let right = nums[rightIndex];
      const sum = cur + left + right;
      if (sum < 0) leftIndex += 1;
      else if (sum > 0) rightIndex -= 1;
      else {
        res.push([cur, left, right]);

        while (nums[leftIndex + 1] === left && leftIndex < rightIndex)
          leftIndex++;
        while (nums[rightIndex - 1] === right && leftIndex < rightIndex)
          rightIndex--;
        leftIndex++;
        rightIndex--;
      }
    }
  }

  return res;
};

console.log(threeSum([0, 0, 0, 0]));
