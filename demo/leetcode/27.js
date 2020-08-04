/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
var removeElement = function (nums, val) {
  for (let index = 0; index < nums.length; ) {
    const cur = nums[index];
    if (cur !== val) index++;
    else nums.splice(index, 1);
  }
};

console.log(removeElement([0, 1, 2, 2, 3, 0, 4, 2], 2));
