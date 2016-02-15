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
        $scope.flowForm = {};
        
        $scope.createDomain = function() {
        	$scope.domainForm.hasErrors = false;
        	$('#domainModal').modal({
    	        backdrop: 'static',
    	        keyboard: true
    	    });
        };
        
        $scope.saveDomain = function() {
        	DataHub.saveDomain($scope.domainForm)
        	.success(function () {
        		$scope.domainForm.hasErrors = false;
        		$scope.status = DataHub.status;
        		$('#domainModal').modal('hide');
            })
            .error(function () {
            	$scope.domainForm.hasErrors = true;
            })
        };
        
        $scope.displayDomain = function(domainName) {
        	DataHub.displayDomain(domainName)
        	.success(function (selectedDomain) {
                DataHub.status.selectedDomain = selectedDomain;
            })
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
        
        $scope.createFlow = function(domainName, flowType) {
        	$scope.flowForm.domainName = domainName;
        	$scope.flowForm.flowType = flowType;
        	$scope.flowForm.hasErrors = false;
        	$('#flowModal').modal({
    	        backdrop: 'static',
    	        keyboard: true
    	    });
        };
        
        $scope.runFlow = function(domainName, flowName) {
        	DataHub.runFlow(domainName, flowName)
        	.success(function () {
        		
            });
        };
        
        $scope.testFlow = function(domainName, flowName) {
        	DataHub.testFlow(domainName, flowName)
        	.success(function () {
        		
            });
        };
        
        $scope.saveFlow = function() {
        	DataHub.saveFlow($scope.flowForm)
        	.success(function () {
        		$scope.flowForm.hasErrors = false;
        		$scope.status = DataHub.status;
        		$('#flowModal').modal('hide');
            })
            .error(function () {
            	$scope.flowForm.hasErrors = true;
            })
        };
        
        setTimeout(function () {
        	$('.alert').fadeOut();
        }, 5000);
        
        
    }
]);