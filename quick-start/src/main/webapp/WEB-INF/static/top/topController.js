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
        $scope.domainForm = {};
        
        console.log('status');
        console.log($scope.status);
        
        $scope.createDomain = function() {
        	$('#domainModal').modal({
    	        backdrop: 'static',
    	        keyboard: true
    	    });
        },
        
        $scope.saveDomain = function() {
        	DataHub.saveDomain($scope.domainForm);
        }
    }
]);