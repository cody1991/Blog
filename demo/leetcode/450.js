/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} key
 * @return {TreeNode}
 */
var deleteNode = function (root, key) {
  if (!root) return root;

  if (root.val > key) {
    root.left = deleteNode(root.left, key);
  } else if (root.val < key) {
    root.right = deleteNode(root.right, key);
  } else {
    if (root.left === null && root.right === null) {
      root = null;
    } else if (root.left !== null && root.right === null) {
      root = root.left;
    } else if (root.right !== null && root.left === null) {
      root = root.right;
    } else if (root.left !== null && root.right !== null) {
      let last = root.left;
      while (last && last.right) {
        last = last.right;
      }
      root.val = last.val;
      root.left = deleteNode(root.left, last.val);
    }
  }

  return root;
};
