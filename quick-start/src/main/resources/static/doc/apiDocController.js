(function () {

  'use strict';

  var dependencies = [];

  angular.module('dhib.quickstart.controller.api.doc', dependencies)
    .controller('apiDocController', ApiDocController);

  function ApiDocController($scope, $window) {

    $scope.loading = false;
    $scope.url = $scope.swaggerUrl = 'v2/api-docs';
    $scope.myErrorHandler =
      function (data, status) {
        window.alert('Failed to load swagger: ' + status + '   ' + data);
      };
    $scope.infos = false;
  }


})();
