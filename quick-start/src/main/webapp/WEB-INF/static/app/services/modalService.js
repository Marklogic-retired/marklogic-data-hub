var dependencies = [
    'ui.bootstrap'
];
var module = angular.module('dhib.quickstart.service.modal', dependencies);
module.factory('ModalService', [
    '$uibModal'
    ,function (
        $uibModal
    ) {
        var service = {
            openLoadDataModal : function () {
                var modalInstance = $uibModal.open({
                    animation : true
                    ,templateUrl : 'top/modal/loadDataModal.html'
                    ,controller : 'loadDataModalController'
                    ,size : 'sm'
                    ,backdrop : 'static'
                    ,keyboard : true
                });
                
                return modalInstance.result;
            }
        };
        
        return service;
    }
]);

module.controller('loadDataModalController', [
    '$scope'
    ,'$uibModalInstance'
    ,function (
        $scope
        ,$uibModalInstance
    ) {
        $scope.inputPath = 'input';
        
        $scope.ok = function () {
            $uibModalInstance.close($scope.inputPath);
        };
        
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);