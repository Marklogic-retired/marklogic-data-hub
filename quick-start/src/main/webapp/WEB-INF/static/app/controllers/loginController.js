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
        
        $scope.login = function() {
            DataHub.login($scope.loginForm)
                .then(function(request) {
                    
                    if (request.status == 200) {
                        $location.path('/top');
                    }
                });
        };
    }
]);