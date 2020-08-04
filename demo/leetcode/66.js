/**
 * @param {number[]} digits
 * @return {number[]}
 */
// var plusOne = function (digits) {
//   let flag = 0;
//   for (let index = digits.length - 1; index >= 0; index--) {
//     if (index === digits.length - 1) {
//       // 最后一个的情况

//       if (digits[index] === 9) {
//         digits[index] = 0;
//         flag = 1;
//       } else {
//         digits[index] += 1;
//       }
//     } else {
//       digits[index] += flag;
//       if (digits[index] === 10) {
//         digits[index] = 0;
//         flag = 1;
//       } else {
//         flag = 0;
//       }
//     }
//   }

//   if (flag === 1) digits.unshift(1);

//   return digits;
// };

// console.log(plusOne([9, 9, 9]));

var plusOne = function (digits) {
  return (BigInt(digits.join("")) + 1n).toString().split("");
};

console.log(plusOne([9, 9, 9]));
