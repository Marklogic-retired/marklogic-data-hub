(function () {

  'use strict';

  angular.module('dhib.quickstart.directives.header', [])
    .directive('header', HeaderDirective);

  function HeaderDirective($http, $location, DataHub, tracingService) {
    return {
      restrict: 'E',
      templateUrl : function(element, attrs) {
        return attrs.templateUrl || 'app/directives/header.html';
      },
      link : function(scope, element, attrs) {
        scope.logout = function () {
          if(scope.action.type !== null && typeof scope.action.type !== 'undefined') {
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
          DataHub.preUninstall();
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

        scope.showApiDoc = function() {
          DataHub.showApiDoc();
        };

        scope.tracingEnabled = false;

        scope.getTracingButton = function() {
          var txt = '';
          txt += (scope.tracingEnabled) ? 'Disable' : 'Enable';
          txt += ' Tracing';
          return txt;
        };

        scope.getTracingUri = function() {
          return 'http://' + scope.status.mlHost + ':' +
            scope.status.mlTracePort + '/';
        };

        scope.toggleTracing = function() {
          if (scope.tracingEnabled) {
            tracingService.disableTracing().then(function() {
              scope.tracingEnabled = false;
            });
          }
          else {
            tracingService.enableTracing().then(function() {
              scope.tracingEnabled = true;
            });
          }
        };

        tracingService.isEnabled().then(function(resp) {
          scope.tracingEnabled = resp.data.enabled;
        });

      }
    };
  }
})();
