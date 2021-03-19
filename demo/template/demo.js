import template from './debug.js';

const myTemplate = template(
  `<span data-message='<%= 'hello' + 'world' %>'>
    <% print('hello msg'); %>
    <%= name ? name: 1+1+1 %>
    <% print('hello msg'); %>
   </span>`
);

// console.log(myTemplate({ name: 'hello 2' }));
