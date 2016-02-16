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
            
            ,saveDomain : function(domainForm) {
            	
            	var promise = $http.post('api/domains', domainForm)
                .success(function (status) {
                    service.status = status;
                })
                .error(function (error) {
                	service.displayMessage(error.message, 'error', 'domainModalMessage', true);
                });
                
                return promise;
            }
            
            ,displayDomain : function(domainName) {
            	return $http.post('api/domains/display', domainName);
            }
            
            ,getStatusChange : function() {
                return $http.get('api/domains/status-change');
            }
           
            ,runFlow : function(domainName, flowName) {
            	var data = {
            		domainName: domainName,
            		flowName: flowName
            	};
            	var promise = $http.post('api/flows/run', data)
                .success(function () {
                	service.displayMessage('Flow run is successful.', 'success', 'notification', false);
                })
                .error(function () {
                	service.displayMessage('Flow run is successful.', 'success', 'notification', false);
                });
                
                return promise;
            }
            
            ,testFlow : function(domainName, flowName) {
            	var data = {
                	domainName: domainName,
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
                .success(function (selectedDomain) {
                    service.status.selectedDomain = selectedDomain;
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