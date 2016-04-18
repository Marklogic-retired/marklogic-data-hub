(function() {

  'use strict';

  angular.module('dhib.quickstart.directives.notification', [])
    .directive('notification', NotificationDirective);

  function NotificationDirective($http, $location, $mdDialog, DataHub, $rootScope, $timeout) {

    return {
      restrict: 'E',

      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'app/directives/notification.html';
      },

      link: function(scope, element, attrs) {

        $rootScope.notificationBar = {
          show: false,
          messageType: '',
          message: ''
        };
        
      }
    };
  }


})();
