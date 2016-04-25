(function() {

  'use strict';

  angular.module('dhib.quickstart.service.modal', ['ui.bootstrap'])
    .filter('GetByFieldAndValue', GetByFieldAndValue)
    .service('ModalService', ModalService)
    .controller('entityModalController', EntityModalController)
    .controller('flowModalController', FlowModalController);

  function GetByFieldAndValue() {
    return function(field, value, collection) {
      var i=0, len=collection.length;
      for (; i<len; i++) {
        if (String(collection[i].Field) === String(field) && String(collection[i].Value) === String(value)) {
          return collection[i];
        }
      }
      return null;
    };
  }

  function ModalService($uibModal) {
    var self = this;

    angular.extend(self, {
      openEntityModal: openEntityModal,
      openFlowModal: openFlowModal
    });

    function openEntityModal() {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'top/modal/entityModal.html',
        controller: 'entityModalController',
        size: 'md',
        backdrop: 'static',
        keyboard: true
      });

      return modalInstance.result;
    }

    function openFlowModal(entityName, flowType, extension) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'top/modal/flowModal.html',
        controller: 'flowModalController',
        size: 'sm',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          'entityName': function() {
            return entityName;
          },
          'flowType': function() {
            return flowType;
          },
          'extension': function() {
            return extension;
          }
        }
      });

      return modalInstance.result;
    }
  }

  function EntityModalController($scope, $uibModalInstance, DataHub) {
    $scope.entityForm = {
      pluginFormat: 'sjs',
      dataFormat: 'application/json'
    };
    $scope.errorMessage = null;
    $scope.hasError = false;

    $scope.ok = function() {
      DataHub.saveEntity($scope.entityForm)
        .success(function() {
          $scope.hasError = false;

          $uibModalInstance.close($scope.entityForm);
        })
        .error(function(error) {
          $scope.hasError = true;
          $scope.errorMessage = error.message;
        })
        .finally(function() {
          $scope.loading = false;
        });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss();
    };
  }

  function FlowModalController($scope, $uibModalInstance, DataHub, entityName, flowType, extension) {
    $scope.flowForm = {
      entityName: entityName,
      flowType: flowType,
      pluginFormat: 'sjs',
      dataFormat: 'application/json'
    };
    $scope.errorMessage = null;
    $scope.hasError = false;

    $scope.ok = function() {
      $scope.loading = true;

      DataHub.saveFlow($scope.flowForm)
        .success(function() {
          $scope.hasError = false;

          $uibModalInstance.close($scope.flowForm);
        })
        .error(function(error) {
          $scope.hasError = true;
          $scope.errorMessage = error.message;
        })
        .finally(function() {
          $scope.loading = false;
        });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss();
    };
  }

})();
