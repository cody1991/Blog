/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function (nums) {
  let count = 0;

  for (let index = 1; index < nums.length; index += 1) {
    const cur = nums[count];
    const next = nums[index];
    if (cur !== next) {
      count += 1;
      nums[count] = next;
    }
  }
  return count + 1;
};

console.log(removeDuplicates([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]));
