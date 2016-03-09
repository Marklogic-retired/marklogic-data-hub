(function () {

  'use strict';

  angular.module('dhib.quickstart.service.modal', ['ui.bootstrap'])
    .service('ModalService', ModalService)
    .controller('loadDataModalController', LoadDataModalController);

  function ModalService($uibModal) {
    var self = this;
    angular.extend(self, {
      openLoadDataModal: openLoadDataModal
    });

    function openLoadDataModal() {
      var modalInstance = $uibModal.open({
        animation : true,
        templateUrl : 'top/modal/loadDataModal.html',
        controller : 'loadDataModalController',
        size : 'sm',
        backdrop : 'static',
        keyboard : true
      });

      return modalInstance.result;
    }
  }

  function LoadDataModalController($scope, $uibModalInstance) {
    $scope.inputPath = 'input';
    $scope.dataFormat = 'documents';
    $scope.collection = null;

    $scope.ok = function () {
      $uibModalInstance.close({
        inputPath: $scope.inputPath,
        dataFormat: $scope.dataFormat,
        collection: $scope.collection
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };
  }

})();
