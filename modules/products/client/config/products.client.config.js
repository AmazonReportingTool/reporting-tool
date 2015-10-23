'use strict';

// Configuring the products module
angular.module('products').run(['Menus',
  function (Menus) {
    // Add the products dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Menu',
      state: 'products',
      type: 'dropdown'
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Dashboard',
      state: 'products.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Sku Report',
      state: 'products.sku'
    });

    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Brand Report',
      state: 'products.brand'
    });
  }
]);