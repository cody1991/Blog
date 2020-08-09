/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function (root) {
  if (!root) return [];
  let result = [];
  dfs(root, 0, result);
  return result;
};

function dfs(root, level, result) {
  if (root) {
    if (!result[level]) result[level] = [];
    result[level].push(root.val);
    dfs(root.left, level + 1, result);
    dfs(root.right, level + 1, result);
  }
}
