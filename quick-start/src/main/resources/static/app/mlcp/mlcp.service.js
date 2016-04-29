(function () {

  'use strict';

  angular.module('mlcp')
    .service('mlcp', MlcpService);

  function MlcpService($uibModal, $http) {
    return {
      showModal: showModal
    };

    function showModal(entityName, flowName, mlcpOptions) {
      var modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'app/mlcp/mlcp.html',
        controller: 'MlcpController',
        controllerAs: 'ctrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          entityName: function() { return entityName; },
          flowName: function() { return flowName; },
          mlcpOptions: function() { return mlcpOptions; }
        }
      });

      return modalInstance.result;
    }
  }

})();
