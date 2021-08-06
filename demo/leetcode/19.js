/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function (head, n) {
  const result = new ListNode(null);
  result.next = head;

  let cur = head;
  let pre = result;

  while (n--) {
    head = head.next;
  }

  while (head) {
    head = head.next;
    cur = cur.next;
    pre = pre.next;
  }

  pre.next = pre.next.next;

  return result.next;
};
