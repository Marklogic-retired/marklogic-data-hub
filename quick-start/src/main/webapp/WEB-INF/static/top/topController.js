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
        		$('#flowModal').modal('hide');
            });
        };
        
        $scope.toggleFolder = function(event) {
        	var folder = event.currentTarget;
        	var state = $(folder).data('state')
        	if(state === 'close') {
        		$(folder).data('state', 'open');
        		$(folder).html('&#9650');
        	} else {
        		$(folder).data('state', 'close');
        		$(folder).html('&#9660');
        	}
        };
        
        $scope.checkIfEmpty = function(directory) {
        	if(directory.directories.length === 0 && directory.files.length === 0) {
        		return true;
        	}
        	return false;
        };
        
        setTimeout(function () {
        	$('.alert').fadeOut();
        }, 5000);
    }
]);