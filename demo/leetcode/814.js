/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var pruneTree = function (root) {
  return deal(root);
};

function deal(root) {
  if (!root) return null;
  if (root.left) {
    root.left = deal(root.left);
  }
  if (root.right) {
    root.right = deal(root.right);
  }

  if (!root.left && !root.right && root.val === 0) {
    root = null;
  }
  return root;
}
