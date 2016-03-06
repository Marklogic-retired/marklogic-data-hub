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
        $scope.entityForm = {};
        $scope.flowForm = {};
        $scope.loadDataForm = {};
        $scope.loading = false;
        $scope.action = DataHub.action;

        $scope.createEntity = function() {
            $scope.loading = true;
            $scope.entityForm.hasErrors = false;
            $('#entityModal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $scope.loading = false;
        };

        $scope.saveEntity = function() {
            $scope.loading = true;
            DataHub.saveEntity($scope.entityForm)
            .success(function () {
                $scope.entityForm.hasErrors = false;
                $scope.status = DataHub.status;
                $('#entityModal').modal('hide');
            })
            .error(function () {
                $scope.entityForm.hasErrors = true;
            })
            .finally(function () {
                $scope.loading = false;
            });
        };

        $scope.displayEntity = function(entityName) {
            $scope.loading = true;
            DataHub.displayEntity(entityName)
            .success(function (selectedEntity) {
                DataHub.status.selectedEntity = selectedEntity;
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

        $scope.createFlow = function(entityName, flowType, extension) {
            $scope.loading = true;
            $scope.flowForm.entityName = entityName;
            $scope.flowForm.flowType = flowType;
            $scope.flowForm.extension = extension;
            $scope.flowForm.hasErrors = false;
            $('#flowModal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $scope.loading = false;
        };

        $scope.showLoadDataForm = function(entityName, flowName) {
            $scope.loading = true;
            $scope.loadDataForm = {
                'hasErrors' : false
                ,'entityName' : entityName
                ,'flowName' : flowName
                ,'inputPath' : 'input'
            };
            $('#loadDataModal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $scope.loading = false;
        };

        $scope.runFlow = function(entityName, flowName) {
            $scope.loading = true;
            DataHub.runFlow(entityName, flowName)
            .success(function () {

            })
            .finally(function () {
                $scope.loading = false;
            });
        };

        $scope.runInputFlow = function() {
            $scope.loading = true;
            $('#loadDataModal').modal('hide');
            DataHub.runInputFlow($scope.loadDataForm.entityName, $scope.loadDataForm.flowName, $scope.loadDataForm.inputPath)
            .success(function () {

            })
            .finally(function () {
                $scope.loading = false;
            });
        };

        $scope.testFlow = function(entityName, flowName) {
            $scope.loading = true;
            DataHub.testFlow(entityName, flowName)
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
