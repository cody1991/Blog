/**
 * @param {number[]} nums
 * @return {number}
 */
var lengthOfLIS = function (nums) {
  if (!nums || nums.length === 0) return 0;
  if (nums.length === 1) return 1;
  const list = [];
  list.push(nums[0]);

  for (let index = 1; index < nums.length; index += 1) {
    const cur = nums[index];
    const last = list[list.length - 1];

    if (cur > last) {
      list.push(cur);
    } else {
      let findIndex = list.length - 1;

      while (list[findIndex] >= cur) {
        findIndex--;
      }

      list.splice(findIndex + 1, 1, cur);
    }

    console.log(list);
  }

  return list.length;
};

console.log(lengthOfLIS([2, 2]));
