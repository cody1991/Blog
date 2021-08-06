/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var maxSlidingWindow = function (nums, k) {
  const queue = [];
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    const cur = nums[i];

    if (queue.length === k) {
      queue.shift();

      while (queue[0] < Math.max(...queue)) {
        queue.shift();
      }
    }

    while (queue[0] < cur) {
      queue.shift();
    }

    queue.push(cur);

    if (i >= k - 1) {
      result.push(queue[0]);
    }
  }

  return result;
};

const nums = [1, 3, 1, 2, 0, 5],
  k = 3;

console.log(maxSlidingWindow(nums, k));
