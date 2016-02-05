var dependencies = [
];
var module = angular.module('dhib.quickstart.service.data-hub', dependencies);
module.factory('DataHub', [
    '$http'
    ,'$q'
    ,function(
        $http
        ,$q
    ) {
        var service = {
            
        	login : function (loginForm) {
                var promise = $http
                .post('api/data-hub/login', loginForm)
                .success(function (data) {
                    service.status = data;
                })
                .error(function () {
                    service.status = null;
                });
                
                return promise;
            }
            
            ,getLoginStatus : function () {
                var promise = $http
                .get('api/data-hub/login')
                .success(function (data) {
                    service.status = data;
                })
                .error(function () {
                    service.status = null;
                });
                
                return promise;
            }
            
            ,logout : function () {
                var promise = $http
                .post('api/data-hub/logout')
                .success(function (data) {
                    service.status = data;
                })
                .error(function () {
                    service.status = null;
                });
                return promise;
            }
            
            ,install : function () {
                var promise = $http.post('api/data-hub/install');
                
                return promise;
            }
            
            ,uninstall : function () {
                var promise = $http.post('api/data-hub/uninstall');
                
                return promise;
            }
            
            ,installUserModules : function () {
                var promise = $http.post('api/data-hub/install-user-modules');
                
                return promise;
            }
        };
        
        return service;
    }
])