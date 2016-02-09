var dependencies = [
    'dhib.quickstart.service.data-hub'
];

var module = angular.module('dhib.quickstart.controller.top', dependencies);

module.controller('topController', [
    '$scope'
    ,'$location'
    ,'$timeout'
    ,'DataHub'
    ,function(
        $scope
        ,$location
        ,$timeout
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
        };
        
        $scope.saveDomain = function() {
        	DataHub.saveDomain($scope.domainForm)
        	.success(function () {
        		$('#domainModal').modal('hide');
            });
        };
        
        $scope.updateDomainStatus = function() {
            DataHub.getDomainChangeList()
            .success(function (domainChangeList) {
                DataHub.status.domains = domainChangeList;
            })
            .then(function () {
                $timeout($scope.updateDomainStatus, 50);
            });
        };
        
        $scope.updateDomainStatus();
    }
]);