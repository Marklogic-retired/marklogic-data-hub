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
        $scope.loadDataForm = {};
        $scope.loading = false;
        
        $scope.createDomain = function() {
            $scope.loading = true;
            $scope.domainForm.hasErrors = false;
            $('#domainModal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $scope.loading = false;
        };
        
        $scope.saveDomain = function() {
            $scope.loading = true;
            DataHub.saveDomain($scope.domainForm)
            .success(function () {
                $scope.domainForm.hasErrors = false;
                $scope.status = DataHub.status;
                $('#domainModal').modal('hide');
            })
            .error(function () {
                $scope.domainForm.hasErrors = true;
            })
            .finally(function () {
                $scope.loading = false;
            });
        };
        
        $scope.displayDomain = function(domainName) {
            $scope.loading = true;
            DataHub.displayDomain(domainName)
            .success(function (selectedDomain) {
                DataHub.status.selectedDomain = selectedDomain;
            })
            .finally(function () {
                $scope.loading = false;
            });
        };
        
        $scope.getStatusChange = function() {
            DataHub.getStatusChange()
            .success(function (loginStatus) {
                DataHub.status = loginStatus;
                $scope.status = DataHub.status;
            })
            .then(function () {
                $timeout($scope.getStatusChange, 50);
            });
        };
        
        $scope.getStatusChange();
        
        $scope.createFlow = function(domainName, flowType) {
            $scope.loading = true;
            $scope.flowForm.domainName = domainName;
            $scope.flowForm.flowType = flowType;
            $scope.flowForm.hasErrors = false;
            $('#flowModal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $scope.loading = false;
        };
        
        $scope.showLoadDataForm = function(domainName, flowName) {
            $scope.loading = true;
            $scope.loadDataForm = {
                'hasErrors' : false
                ,'domainName' : domainName
                ,'flowName' : flowName
                ,'inputPath' : 'input'
            };
            $('#loadDataModal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $scope.loading = false;
        };
        
        $scope.runFlow = function(domainName, flowName) {
            $scope.loading = true;
            DataHub.runFlow(domainName, flowName)
            .success(function () {
                
            })
            .finally(function () {
                $scope.loading = false;
            });
        };
        
        $scope.runInputFlow = function() {
            $scope.loading = true;
            $('#loadDataModal').modal('hide');
            DataHub.runInputFlow($scope.loadDataForm.domainName, $scope.loadDataForm.flowName, $scope.loadDataForm.inputPath)
            .success(function () {
                
            })
            .finally(function () {
                $scope.loading = false;
            });
        };
        
        $scope.testFlow = function(domainName, flowName) {
            $scope.loading = true;
            DataHub.testFlow(domainName, flowName)
            .success(function () {
                
            })
            .finally(function () {
                $scope.loading = false;
            });
        };
        
        $scope.saveFlow = function() {
            $scope.loading = true;
            DataHub.saveFlow($scope.flowForm)
            .success(function () {
                $scope.flowForm.hasErrors = false;
                $scope.status = DataHub.status;
                $('#flowModal').modal('hide');
            })
            .error(function () {
                $scope.flowForm.hasErrors = true;
            })
            .finally(function () {
                $scope.loading = false;
            });
        };
        
        setTimeout(function () {
            $('.alert').fadeOut();
        }, 5000);
        
        
    }
]);