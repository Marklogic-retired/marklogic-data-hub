(function() {

  'use strict';


  var dependencies = [
    'dhib.quickstart.service.data-hub',
    'dhib.quickstart.service.modal'
  ];

  angular.module('dhib.quickstart.controller.top', dependencies)
    .controller('topController', TopController);

  function TopController($scope, $location, $timeout, DataHub,
    ModalService, TaskManager, mlcp) {

    $scope.status = DataHub.status;
    $scope.entityForm = {};
    $scope.flowForm = {};
    $scope.loadDataForm = {
      dataFormat: 'documents'
    };
    $scope.loading = false;
    $scope.action = DataHub.action;

    $scope.createEntity = function() {
      ModalService.openEntityModal();
    };

    $scope.displayEntity = function(entityName) {
      $scope.loading = true;
      DataHub.displayEntity(entityName)
        .success(function(selectedEntity) {
          DataHub.status.selectedEntity = selectedEntity;
        })
        .finally(function() {
          $scope.loading = false;
        });
    };

    $scope.getStatusChange = function() {
      DataHub.getStatusChange()
        .success(function(loginStatus) {
          DataHub.status = loginStatus;
          $scope.status = DataHub.status;
        })
        .then(function() {
          $timeout($scope.getStatusChange, 50);
        });
    };

    $scope.createFlow = function(entityName, flowType, extension) {
      ModalService.openFlowModal(entityName, flowType, extension);
    };

    $scope.runInputFlow = function(flow) {
      $scope.loading = true;
      DataHub.getPreviousOptions(flow.entityName, flow.flowName)
        .success(function(mlcpOptions) {
          $scope.loading = false;
          mlcp.showModal(flow.entityName, flow.flowName, mlcpOptions)
          .then(function(result) {
            $scope.loading = true;
            flow.inputFlowCancelled = false;

            var data = {
              flow: flow,
              mlcp: result
            };
            DataHub.runInputFlow(data)
              .success(function(taskId) {
                flow.inputFlowTaskId = taskId;

                TaskManager.waitForTask(flow.inputFlowTaskId)
                  .success(function(result) {
                    if (!flow.inputFlowCancelled) {
                      if (result.success) {
                        DataHub.displayMessage('Load data successful.', 'success');
                      } else {
                        DataHub.displayMessage(result.errorMessage, 'error');
                      }
                    }
                  })
                  .error(function() {
                    if (!flow.inputFlowCancelled) {
                      DataHub.displayMessage('Load data unsuccessful.', 'error');
                    }
                  })
                  .finally(function() {
                    flow.inputFlowTaskId = null;
                    $scope.loading = false;
                  });
              })
              .error(function() {
                $scope.loading = false;
              });
          });
        });
    };

    $scope.cancelInputFlow = function(flow) {
      flow.inputFlowCancelled = true;
      DataHub.displayMessage('Load data cancelled.', 'success');
      TaskManager.cancelTask(flow.inputFlowTaskId);
    };

    $scope.runFlow = function(flow) {
      $scope.loading = true;
      flow.runFlowCancelled = false;

      DataHub.runFlow(flow.entityName, flow.flowName)
        .success(function(taskId) {
          flow.runFlowTaskId = taskId;

          TaskManager.waitForTask(flow.runFlowTaskId)
            .success(function(result) {
              if (!flow.runFlowCancelled) {
                if (result.success) {
                  DataHub.displayMessage('Flow run is successful.', 'success');
                } else {
                  DataHub.displayMessage(result.errorMessage, 'error');
                }
              }
            })
            .error(function() {
              if (!flow.runFlowCancelled) {
                DataHub.displayMessage('Flow run is unsuccessful.', 'error');
              }
            })
            .finally(function() {
              flow.runFlowTaskId = null;
              $scope.loading = false;
            });
        })
        .error(function() {
          $scope.loading = false;
        });
    };

    $scope.cancelRunFlow = function(flow) {
      flow.runFlowCancelled = true;
      DataHub.displayMessage('Flow run cancelled.', 'success');
      TaskManager.cancelTask(flow.runFlowTaskId);
    };

    $scope.testFlow = function(flow) {
      $scope.loading = true;
      flow.testFlowCancelled = false;

      DataHub.testFlow(flow.entityName, flow.flowName)
        .success(function(taskId) {
          flow.testFlowTaskId = taskId;

          TaskManager.waitForTask(flow.testFlowTaskId)
            .success(function(result) {
              if (!flow.testFlowCancelled) {
                DataHub.displayMessage('Flow test is successful.', 'success');
              }
            })
            .error(function() {
              if (!flow.testFlowCancelled) {
                DataHub.displayMessage('Flow test is unsuccessful.', 'error');
              }
            })
            .finally(function() {
              flow.testFlowTaskId = null;
              $scope.loading = false;
            });
        })
        .error(function() {
          $scope.loading = false;
        });
    };

    $scope.cancelTestFlow = function(flow) {
      flow.testFlowCancelled = true;
      DataHub.displayMessage('Flow test cancelled.', 'success');
      TaskManager.cancelTask(flow.testFlowTaskId);
    };

    $scope.install = function() {
      DataHub.install();
    };

    $scope.uninstall = function() {
      DataHub.uninstall()
        .success(function() {
          DataHub.logout();
          $location.path('/login');
        });
    };

    if ($scope.action.type !== null && $scope.action.type === 'Install') {
      $scope.install();
    } else if ($scope.action.type !== null && $scope.action.type === 'Uninstall') {
      $scope.uninstall();
    } else if ($scope.status !== null) {
      $scope.getStatusChange();
    }

    $scope.$on('hub:deploy:errors', function($event, errors) {
      $scope.deployErrors = errors;
    });
  }

})();
