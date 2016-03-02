var dependencies = [
    'dhib.quickstart.service.data-hub'
    ,'dhib.quickstart.service.modal'
];

var module = angular.module('dhib.quickstart.controller.top', dependencies);

module.controller('topController', [
    '$scope'
    ,'$location'
    ,'$timeout'
    ,'DataHub'
    ,'ModalService'
    ,'TaskManager'
    ,function(
        $scope
        ,$location
        ,$timeout
        ,DataHub
        ,ModalService
        ,TaskManager
    ) {
        $scope.status = DataHub.status;
        $scope.domainForm = {};
        $scope.flowForm = {};
        $scope.loadDataForm = {};
        $scope.loading = false;
        $scope.action = DataHub.action;

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

        $scope.createFlow = function(domainName, flowType, extension) {
            $scope.loading = true;
            $scope.flowForm.domainName = domainName;
            $scope.flowForm.flowType = flowType;
            $scope.flowForm.extension = extension;
            $scope.flowForm.hasErrors = false;
            $('#flowModal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $scope.loading = false;
        };

        $scope.runInputFlow = function(flow) {
            ModalService.openLoadDataModal().then(function (inputPath) {
                DataHub.runInputFlow(flow.domainName, flow.flowName, inputPath)
                .success(function (taskId) {
                    flow.inputFlowTaskId = taskId;
                    
                    console.log('Running input flow using task id: ' + flow.inputFlowTaskId);
                    
                    TaskManager.waitForTask(flow.inputFlowTaskId)
                    .success(function (result) {
                        console.log('done waiting for task. task result:');
                        console.log(result);
                        
                        DataHub.displayMessage('Flow data load is successful.', 'success', 'notification', false);
                    })
                    .error(function () {
                        DataHub.displayMessage('Flow data load is unsuccessful.', 'error', 'notification', false);
                    })
                    .finally(function () {
                        flow.inputFlowTaskId = null;
                        $scope.loading = false;
                    });
                });
            });
        };
        
        $scope.cancelInputFlow = function(flow) {
            TaskManager.cancelTask(flow.inputFlowTaskId);
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

        $scope.install = function () {
    		DataHub.install();
        };

        $scope.uninstall = function () {
    		DataHub.uninstall()
    		.success(function () {
    			DataHub.logout();
    			$location.path('/login');
            });
        };

        if($scope.action.type !== null && $scope.action.type === 'Install') {
        	$scope.install();
        } else if($scope.action.type !== null && $scope.action.type === 'Uninstall') {
        	$scope.uninstall();
        } else if($scope.status !== null){
        	$scope.getStatusChange();
        }

        setTimeout(function () {
            $('.alert').fadeOut();
        }, 5000);


    }
]);
