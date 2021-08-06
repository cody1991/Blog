/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function (nums1, nums2) {
  const map = {};
  const res = [];

  for (let item of nums1) {
    map[item] = map[item] ? map[item] + 1 : 1;
  }

  for (let item of nums2) {
    if (map[item]) {
      map[item]--;
      res.push(item);
    }
  }

  return res;
};

intersect([1, 2, 2, 1], [2, 2]);
