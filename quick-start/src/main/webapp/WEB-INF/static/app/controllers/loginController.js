var dependencies = [
    'dhib.quickstart.service.data-hub'
];

var module = angular.module('dhib.quickstart.controller.login', dependencies);

module.controller('loginController', [
    '$scope'
    ,'$location'
    ,'DataHub'
    ,function(
        $scope
        ,$location
        ,DataHub
    ) {
        $scope.loginForm = {};
        $scope.hasErrors = false;
        $scope.errors = {};
        
        $scope.login = function() {
            DataHub.login($scope.loginForm)
                .then(function(request) {
                	if(DataHub.status && !DataHub.status.hasErrors) {
                		$scope.hasErrors = false;
                		$scope.errors = null;
                    	$location.path('/top');
                    } else if(DataHub.status){
                    	$scope.hasErrors = true;
                    	$scope.errors = DataHub.status.errors;
                    }
                });
        };
        
        DataHub.getLoginStatus().then(function (request) {
        	$scope.loginForm = DataHub.status;
            if (DataHub.status && DataHub.status.skipLogin) {
            	$location.path('/top');
            }
        });
    }
]);