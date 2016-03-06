var dependencies = [
	'ngRoute'
];
var module = angular.module('dhib.quickstart.service.data-hub', dependencies);
module.factory('DataHub', [
    '$http'
    ,'$q'
    ,'$route'
    ,function(
        $http
        ,$q
        ,$route
    ) {
        var service = {
        		
        	action : {}
            
        	,login : function (loginForm) {
                var promise = $http
                .post('api/data-hub/login', loginForm)
                .success(function (data) {
                    service.status = data;
                    if(!service.status.installed) {
                    	service.action.type = "Install";
                    	service.action.message = "Install is in progress...";
                    	service.action.progressType = "success";
                    }
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
            
            ,reloadRoute : function () {
            	$route.reload();
            }
            
            ,install : function () {
                var promise = $http.post('api/data-hub/install')
                .success(function (status) {
                	service.status = status;
                	service.action.type = null;
                	service.displayMessage('Install is successful.', 'success', 'notification', false);
                	service.reloadRoute();
                })
                .error(function () {
                	service.action.message = "Install is unsuccessful.";
                	service.action.progressType = "danger";
                	//service.displayMessage('Install is unsuccessful.', 'error', 'notification', false);
                });
                
                return promise;
            }
            
            ,preUninstall : function() {
            	service.action.type = 'Uninstall';
            	service.action.progressType = 'success';
            	service.action.message = 'Uninstall is in progress';
            	service.reloadRoute();
            }
            
            ,uninstall : function () {
                var promise = $http.post('api/data-hub/uninstall')
                .success(function (status) {
                	service.status = status;
                	service.action.type = "Uninstall";
                	service.action.message = "Uninstall is successful.";
                	//service.displayMessage('Uninstall is successful.', 'success', 'notification', false);
                	//service.reloadRoute();
                })
                .error(function () {
                	service.action.message = "Uninstall is unsuccessful.";
                	service.action.progressType = "danger";
                	//service.displayMessage('Uninstall is unsuccessful.', 'error', 'notification', false);
                });
                
                return promise;
            }
            
            ,installUserModules : function () {
                var promise = $http.post('api/data-hub/install-user-modules')
                .success(function () {
                	service.displayMessage('Deploy to server is successful.', 'success', 'notification', false);
                })
                .error(function () {
                	service.displayMessage('Deploy to server is unsuccessful.', 'error', 'notification', false);
                });
                
                return promise;
            }
            
            ,saveEntity : function(entityForm) {
            	
            	var promise = $http.post('api/entities', entityForm)
                .success(function (status) {
                    service.status = status;
                    service.displayMessage('New entity is created successfully.', 'success', 'notification', false);
                })
                .error(function (error) {
                	service.displayMessage(error.message, 'error', 'entityModalMessage', true);
                });
                
                return promise;
            }
            
            ,displayEntity : function(entityName) {
            	return $http.post('api/entities/display', entityName);
            }
            
            ,getStatusChange : function() {
                return $http.get('api/entities/status-change');
            }
           
            ,runFlow : function(entityName, flowName) {
            	var data = {
            		entityName: entityName,
            		flowName: flowName
            	};
            	var promise = $http.post('api/flows/run', data)
                .success(function () {
                	service.displayMessage('Flow run is successful.', 'success', 'notification', false);
                })
                .error(function () {
                	service.displayMessage('Flow run is unsuccessful.', 'error', 'notification', false);
                });
                
                return promise;
            }
            
            ,runInputFlow : function(entityName, flowName, path) {
                var data = {
                    'entityName' : entityName
                    ,'flowName': flowName
                    ,'inputPath' : path
                };
                var promise = $http.post('api/flows/run/input', data)
                .success(function () {
                    service.displayMessage('Flow data load is successful.', 'success', 'notification', false);
                })
                .error(function () {
                    service.displayMessage('Flow data load is unsuccessful.', 'error', 'notification', false);
                });
                
                return promise;
            }
            
            ,testFlow : function(entityName, flowName) {
            	var data = {
            		entityName: entityName,
                	flowName: flowName
                };
            	var promise = $http.post('api/flows/test', data)
                .success(function () {
                    service.displayMessage('Flow test is successful.', 'success', 'notification', false);
                })
                .error(function () {
                	service.displayMessage('Flow test is unsuccessful.', 'error', 'notification', false);
                });
                
                return promise;
            }
            
            ,saveFlow : function(flowForm) {
            	
            	var promise = $http.post('api/flows', flowForm)
                .success(function (selectedEntity) {
                    service.status.selectedEntity = selectedEntity;
                    service.displayMessage('New flow is created successfully.', 'success', 'notification', false);
                })
                .error(function (error) {
                	service.displayMessage(error.message, 'error', 'flowModalMessage', true);
                });
                
                return promise;
            }
            
            
            ,displayMessage : function(message,messageType,elementId,isModal) {
            	var targetDiv = elementId;
            	if(typeof elementId === 'undefined') {
            		elementId = 'messageDiv';
            	}
            	var messageClass = 'alert';
            	if(messageType === 'error') {
            		messageClass += ' alert-error alert-danger';
            	} else if (messageType === 'success') {
            		messageClass += ' alert-success';
            	} else if (messageType === 'warning') {
            		messageClass += ' alert-warning';
            	}
            	$('#'+elementId).html('<div class="'+messageClass+'">'+
            			'<a href="dismiss" class="close" data-dismiss="alert">&times;</a>'+message+'</div>');
            			
            	if(isModal) {
            		$('.modal-body').scrollTop(0);
            	} else {
            		$('#'+elementId).scrollTop(0);
            	}
            	setTimeout(function () {
            		$('.alert').fadeOut();
            	}, 5000);
            }
        };
        
        return service;
    }
])