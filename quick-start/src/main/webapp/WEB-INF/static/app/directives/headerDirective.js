var dependencies = [
];
var module = angular.module('dhib.quickstart.directives.header', dependencies);
module.directive('header', [
    '$http'
    ,'$location'
    ,'$mdDialog'
    ,'DataHub'
    ,function(
        $http
        ,$location
        ,$mdDialog
        ,DataHub
    ) {
    	return {
            restrict: 'E'
            ,templateUrl : function(element, attrs) {
                return attrs.templateUrl || 'app/directives/header.html';
            }
            ,link : function(scope, element, attrs) {
            	scope.logout = function () {
            		if(scope.action.type != null) {
            			return;
            		}
            		scope.loading = true;
            		DataHub.logout()
            		.finally(function () {
            			scope.loading = false;
            			$location.path('/login');
                    });
            	},
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
                },
                scope.installUserModules = function () {
                	scope.action.type = 'Deploy to Server';
                	scope.action.progressType = 'success';
                	scope.action.message = 'Deploy to Server is in progress';
                    DataHub.installUserModules()
                    .finally(function () {
                    	scope.action.type = null;
                    });
                }
            }
            ,controller : function($scope, $element, $attrs, $transclude) {
            }
        };
    }
]);