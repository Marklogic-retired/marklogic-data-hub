(function () {

  'use strict';

  angular.module('dhib.quickstart.directives.header', [])
    .directive('header', HeaderDirective);

  function HeaderDirective($http, $location, $mdDialog, DataHub) {
    return {
      restrict: 'E',
      templateUrl : function(element, attrs) {
        return attrs.templateUrl || 'app/directives/header.html';
      },
      link : function(scope, element, attrs) {
        scope.logout = function () {
          if(scope.action.type !== null) {
            return;
          }
          scope.loading = true;
          DataHub.logout()
          .finally(function () {
            scope.loading = false;
            $location.path('/login');
          });
        };
        
        scope.uninstall = function (ev) {
          var confirm = $mdDialog.confirm().title('Confirm Uninstall')
            .textContent('Do you really want to continue uninstalling data hub?')
            .ariaLabel('Uninstall')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
          $mdDialog.show(confirm).then(function() {
            DataHub.preUninstall();
          }, function() {
            //do nothing
          });
        };

        scope.installUserModules = function () {
          scope.action.type = 'Deploy to Server';
          scope.action.progressType = 'success';
          scope.action.message = 'Deploy to Server is in progress';
          DataHub.installUserModules()
          .finally(function () {
            scope.status = DataHub.status;
            scope.action.type = null;
          });
        };
      }
    };
  }
})();
