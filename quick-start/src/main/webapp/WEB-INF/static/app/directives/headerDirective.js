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
            ,templateUrl : function(element, attrs) {
                return attrs.templateUrl || 'app/directives/header.html';
            }
            ,link : function(scope, element, attrs) {
            	scope.logout = function () {
            		scope.loading = true;
            		DataHub.logout()
            		.finally(function () {
            			scope.loading = false;
            			$location.path('/login');
                    });
            	},
            	scope.uninstall = function () {
            		DataHub.preUninstall();
                },
                scope.installUserModules = function () {
                	scope.loading = true;
                    DataHub.installUserModules()
                    .finally(function () {
                    	scope.loading = false;
                    });
                }
            }
            ,controller : function($scope, $element, $attrs, $transclude) {
            }
        };
    }
]);