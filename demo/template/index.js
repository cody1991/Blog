const template = require('./template');

// const myTemplate = template(
//   `<span data-message='<%= 'hello' + 'world' %>'>
//     <% print('hello msg'); %>
//     <%= name ? name: 1+1+1 %>
//     <% print('hello msg'); %>
//    </span>`
// );

// console.log(myTemplate({ name: 'hello 2' }));

function test(obj) {
  var p = [],
    print = function () {
      p.push.apply(p, arguments);
    };
  with (obj) {
    p.push("<span data-message='", 'hello' + 'world', "'>     ");
    print('hello msg');
    p.push('     ', name ? name : 1 + 1 + 1, '     ');
    print('hello msg');
    p.push('    </span>');
  }
  return p.join('');
}

console.log(test({ name: 'hello11' }));
