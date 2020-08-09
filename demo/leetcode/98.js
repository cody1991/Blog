/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isValidBST = function (root) {
  if (!root) return true;

  return dfs(root, -Infinity, Infinity);
};

function dfs(root, min, max) {
  if (!root) return true;

  if (root.val <= min || root.val >= max) return false;

  return dfs(root.left, min, root.val) && dfs(root.right, root.val, max);
}
