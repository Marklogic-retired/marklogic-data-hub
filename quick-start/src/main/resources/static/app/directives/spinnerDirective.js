(function () {

  'use strict';

  angular.module('dhib.quickstart.directives.spinner', [])
    .directive('spinner', SpinnerDirective);

  function SpinnerDirective() {
    return {
      restrict: 'E',
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'app/directives/spinner.html';
      }
    };
  }

})();
