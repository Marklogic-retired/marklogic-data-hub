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
                status : '='
            }
            ,transclude: true
            ,templateUrl : function(element, attrs) {
                return attrs.templateUrl || 'app/directives/header.html';
            }
            ,link : function(scope, element, attrs) {
            	scope.logout = function () {
            		DataHub.logout();
            		$location.path('/login');
            	},
            	scope.install = function () {
                    DataHub.install();
                },
                scope.uninstall = function () {
                    DataHub.uninstall();
                },
                scope.installUserModules = function () {
                    DataHub.installUserModules();
                }
            }
            ,controller : function($scope, $element, $attrs, $transclude) {
            }
        };
    }
]);