var dependencies = [
];
var module = angular.module('dhib.quickstart.directives.header', dependencies);
module.directive('header', [
    '$http'
    ,'$location'
    ,function(
        $http
        ,$location
    ) {
        return {
            restrict: 'E'
            ,scope : {
                activeTab : '='
            }
            ,transclude: true
            ,templateUrl : function(element, attrs) {
                return attrs.templateUrl || 'directives/header.html';
            }
            ,link : function(scope, element, attrs) {
            }
            ,controller : function($scope, $element, $attrs, $transclude) {
            }
        };
    }
]);