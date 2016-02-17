var dependencies = [
];
var module = angular.module('dhib.quickstart.directives.spinner', dependencies);
module.directive('spinner', [
    function(
    ) {
        return {
            restrict: 'E'
            ,templateUrl : function(element, attrs) {
                return attrs.templateUrl || 'app/directives/spinner.html';
            }
            ,link : function(scope, element, attrs) {
            }
            ,controller : function($scope, $element, $attrs, $transclude) {
            }
        };
    }
]);