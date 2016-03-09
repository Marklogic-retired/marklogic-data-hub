(function () {

  'use strict';


  var dependencies = [
    'dhib.quickstart.service.data-hub',
    'dhib.quickstart.service.modal'
  ];

  angular.module('dhib.quickstart.controller.top', dependencies)
    .controller('topController', TopController);

  function TopController($scope, $location, $timeout, DataHub,
    ModalService, TaskManager) {

    $scope.status = DataHub.status;
    $scope.entityForm = {};
    $scope.flowForm = {};
    $scope.loadDataForm = {
      dataFormat: 'documents'
    };
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

    $scope.runInputFlow = function(flow) {
      ModalService.openLoadDataModal().then(function (result) {
        $scope.loading = true;
        flow.inputFlowCancelled = false;

        DataHub.runInputFlow(flow.entityName, flow.flowName, result)
        .success(function (taskId) {
          flow.inputFlowTaskId = taskId;

          TaskManager.waitForTask(flow.inputFlowTaskId)
          .success(function (result) {
            if (!flow.inputFlowCancelled) {
              DataHub.displayMessage('Load data successful.', 'success', 'notification', false);
            }
          })
          .error(function () {
            if (!flow.inputFlowCancelled) {
              DataHub.displayMessage('Load data unsuccessful.', 'error', 'notification', false);
            }
          })
          .finally(function () {
            flow.inputFlowTaskId = null;
            $scope.loading = false;
          });
        })
        .error(function () {
          $scope.loading = false;
        });
      });
    };

    $scope.cancelInputFlow = function(flow) {
      flow.inputFlowCancelled = true;
      DataHub.displayMessage('Load data cancelled.', 'success', 'notification', false);
      TaskManager.cancelTask(flow.inputFlowTaskId);
    };

    $scope.runFlow = function(flow) {
      $scope.loading = true;
      flow.runFlowCancelled = false;

      DataHub.runFlow(flow.entityName, flow.flowName)
      .success(function (taskId) {
        flow.runFlowTaskId = taskId;

        TaskManager.waitForTask(flow.runFlowTaskId)
        .success(function (result) {
          if (!flow.runFlowCancelled) {
            DataHub.displayMessage('Flow run is successful.', 'success', 'notification', false);
          }
        })
        .error(function () {
          if (!flow.runFlowCancelled) {
            DataHub.displayMessage('Flow run is unsuccessful.', 'error', 'notification', false);
          }
        })
        .finally(function () {
          flow.runFlowTaskId = null;
          $scope.loading = false;
        });
      })
      .error(function () {
        $scope.loading = false;
      });
    };

    $scope.cancelRunFlow = function(flow) {
      flow.runFlowCancelled = true;
      DataHub.displayMessage('Flow run cancelled.', 'success', 'notification', false);
      TaskManager.cancelTask(flow.runFlowTaskId);
    };

    $scope.testFlow = function(flow) {
      $scope.loading = true;
      flow.testFlowCancelled = false;

      DataHub.testFlow(flow.entityName, flow.flowName)
      .success(function (taskId) {
        flow.testFlowTaskId = taskId;

        TaskManager.waitForTask(flow.testFlowTaskId)
        .success(function (result) {
          if (!flow.testFlowTaskId) {
            DataHub.displayMessage('Flow test is successful.', 'success', 'notification', false);
          }
        })
        .error(function () {
          if (!flow.testFlowTaskId) {
            DataHub.displayMessage('Flow test is unsuccessful.', 'error', 'notification', false);
          }
        })
        .finally(function () {
          flow.testFlowTaskId = null;
          $scope.loading = false;
        });
      })
      .error(function () {
        $scope.loading = false;
      });
    };

    $scope.cancelTestFlow = function(flow) {
      flow.testFlowCancelled = true;
      DataHub.displayMessage('Flow test cancelled.', 'success', 'notification', false);
      TaskManager.cancelTask(flow.testFlowTaskId);
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
    }
    else if($scope.action.type !== null && $scope.action.type === 'Uninstall') {
      $scope.uninstall();
    }
    else if($scope.status !== null){
      $scope.getStatusChange();
    }

    setTimeout(function () {
      $('.alert').fadeOut();
    }, 5000);
  }

})();
