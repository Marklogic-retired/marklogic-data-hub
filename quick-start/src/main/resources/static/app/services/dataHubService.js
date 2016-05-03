(function() {

  'use strict';

  angular.module('dhib.quickstart.service.data-hub', ['ngRoute'])
    .service('DataHub', DataHubService)
    .service('TaskManager', TaskManagerService);

  function DataHubService($http, $q, $route, $rootScope, $window) {
    var self = this;

    angular.extend(self, {
      action: {},

      login: login,
      getLoginStatus: getLoginStatus,
      logout: logout,
      reloadRoute: reloadRoute,
      install: install,
      preUninstall: preUninstall,
      uninstall: uninstall,
      installUserModules: installUserModules,
      validateUserModules: validateUserModules,
      saveEntity: saveEntity,
      displayEntity: displayEntity,
      getStatusChange: getStatusChange,
      runFlow: runFlow,
      runInputFlow: runInputFlow,
      testFlow: testFlow,
      saveFlow: saveFlow,
      displayMessage: displayMessage,
      searchPath: searchPath,
      showApiDoc: showApiDoc,
      getPreviousOptions: getPreviousOptions
    });

    function login(loginForm) {
      return $http.post('api/data-hub/login', loginForm)
        .success(function(data) {
          self.status = data;
          if (!self.status.installed) {
            self.action.type = 'Install';
            self.action.message = 'Installing the Data Hub into MarkLogic...';
            self.action.progressType = 'success';
          }
        })
        .error(function() {
          self.status = null;
        });
    }

    function getLoginStatus() {
      return $http.get('api/data-hub/login')
        .success(function(data) {
          self.status = data;
        })
        .error(function() {
          self.status = null;
        });
    }

    function logout() {
      return $http.post('api/data-hub/logout')
        .success(function(data) {
          self.status = data;
        })
        .error(function() {
          self.status = null;
        });
    }

    function reloadRoute() {
      $route.reload();
    }

    function install() {
      return $http.post('api/data-hub/install')
        .success(function(status) {
          self.status = status;
          self.action.type = null;
          self.displayMessage('Install is successful.', 'success');
          self.reloadRoute();
        })
        .error(function() {
          self.action.message = 'Install is unsuccessful.';
          self.action.progressType = 'danger';
          //self.displayMessage('Install is unsuccessful.', 'error');
        });
    }

    function preUninstall() {
      self.action.type = 'Uninstall';
      self.action.progressType = 'success';
      self.action.message = 'Uninstall is in progress';
      self.reloadRoute();
    }

    function uninstall() {
      return $http.post('api/data-hub/uninstall')
        .success(function(status) {
          self.status = status;
          self.action.type = 'Uninstall';
          self.action.message = 'Uninstall is successful.';
          //self.displayMessage('Uninstall is successful.', 'success');
          //self.reloadRoute();
        })
        .error(function() {
          self.action.message = 'Uninstall is unsuccessful.';
          self.action.progressType = 'danger';
          //self.displayMessage('Uninstall is unsuccessful.', 'error');
        });
    }

    function installUserModules() {
      return $http.post('api/data-hub/install-user-modules')
      .then(function (resp) {
        return validateUserModules().then(function() {
          self.status = resp.data;
          self.displayMessage('Deploy to server is successful.', 'success');
        });
      })
      .catch(function () {
        self.displayMessage('Deploy to server is unsuccessful.', 'error');
      });
    }

    function validateUserModules() {
      return $http.get('api/data-hub/validate-user-modules').then(function(resp) {
        $rootScope.$broadcast('hub:deploy:errors', resp.data.errors);
      });
    }

    function saveEntity(entityForm) {
      return $http.post('api/entities', entityForm)
        .success(function(status) {
          self.status = status;
          self.displayMessage('New entity is created successfully.', 'success');
        });
    }

    function displayEntity(entityName) {
      return $http.post('api/entities/display', entityName);
    }

    function getStatusChange() {
      return $http.get('api/entities/status-change');
    }

    function runFlow(entityName, flowName) {
      var data = {
        entityName: entityName,
        flowName: flowName
      };
      return $http.post('api/flows/run', data);
    }

    function runInputFlow(data) {
      return $http.post('api/flows/run/input', data);
    }

    function testFlow(entityName, flowName) {
      var data = {
        entityName: entityName,
        flowName: flowName
      };
      return $http.post('api/flows/test', data);
    }

    function saveFlow(flowForm) {
      return $http.post('api/flows', flowForm)
        .success(function(selectedEntity) {
          self.status.selectedEntity = selectedEntity;
          self.displayMessage('New flow is created successfully.', 'success');
        });
    }

    function searchPath(pathPrefix) {
      var data = {
        path: pathPrefix
      };

      return $http.post('api/utils/searchPath', data);
    }

    function displayMessage(message, messageType, elementId) {
      $rootScope.notificationBar.messageType = messageType;
      $rootScope.notificationBar.message = message;
      $rootScope.notificationBar.show = true;
    }

    function showApiDoc() {
      $window.open('#/api-doc', '_blank');
    }

    function getPreviousOptions(entityName, flowName) {
      var params = {
        entityName: entityName,
        flowName: flowName
      };
      return $http.get('api/flows/options', {
        'params': params
      });
    }
  }

  function TaskManagerService($http, $q, $route) {
    var self = this;
    angular.extend(self, {
      waitForTask: waitForTask,
      cancelTask: cancelTask
    });

    function waitForTask(taskId) {
      var params = {
        'taskId': taskId
      };
      return $http.get('api/task/wait', {
        'params': params
      });
    }

    function cancelTask(taskId) {
      var params = {
        'taskId': taskId
      };
      return $http.post('api/task/stop', params);
    }
  }
})();
