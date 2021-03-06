'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

var app = angular.module('myApp', []);
angular.module('core').controller('customersCtrl', function($scope, $http) {
    $http.get('http://www.w3schools.com/angular/customers.php')
    .success(function (response) {$scope.names = response.records;});
});


angular.module('core').controller('TabController', function(){
    this.tab = 1;

    this.setTab = function(newValue){
      this.tab = newValue;
    };

    this.isSet = function(tabName){
      return this.tab === tabName;
    };
  });
