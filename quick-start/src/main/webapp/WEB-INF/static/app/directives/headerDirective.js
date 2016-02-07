var dependencies = [
];
var module = angular.module('dhib.quickstart.directives.header', dependencies);
module.directive('header', [
    '$http'
    ,'$location'
    ,'DataHub'
    ,function(
        $http
        ,$location
        ,DataHub
    ) {
    	return {
            restrict: 'E'
            ,scope : {
                activeTab : '=',
                username : '='
            }
            ,transclude: true
            ,templateUrl : function(element, attrs) {
                return attrs.templateUrl || 'directives/header.html';
            }
            ,link : function(scope, element, attrs) {
            	scope.logout = function () {
            		DataHub.logout();
            		$location.path('/login');
            	}
            }
            ,controller : function($scope, $element, $attrs, $transclude) {
            }
        };
    }
]);