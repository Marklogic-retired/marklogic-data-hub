var dependencies = [
    'dhib.quickstart.service.data-hub'
];

var module = angular.module('dhib.quickstart.controller.top', dependencies);

module.controller('topController', [
    '$scope'
    ,'$location'
    ,'DataHub'
    ,function(
        $scope
        ,$location
        ,DataHub
    ) {
        $scope.status = DataHub.status;
        
        console.log('status');
        console.log($scope.status);
        
        $scope.install = function () {
            DataHub.install();
        };
        
        $scope.uninstall = function () {
            DataHub.uninstall();
        };
        
        $scope.installUserModules = function () {
            DataHub.installUserModules();
        };
    }
]);