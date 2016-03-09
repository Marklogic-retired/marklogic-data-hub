(function () {

  'use strict';

  angular.module('dhib.quickstart.directives.footer', [])
    .directive('footer', FooterDirective);

  function FooterDirective($http, $location) {
    return {
      restrict: 'E',
      scope : {
        activeTab : '='
      },
      transclude: true,
      templateUrl : function(element, attrs) {
        return attrs.templateUrl || 'app/directives/footer.html';
      }
    };
  }
})();
