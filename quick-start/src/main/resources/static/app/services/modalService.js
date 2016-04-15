(function() {

  'use strict';

  angular.module('dhib.quickstart.service.modal', ['ui.bootstrap'])
    .filter('GetByFieldAndValue', GetByFieldAndValue)
    .service('ModalService', ModalService)
    .controller('loadDataModalController', LoadDataModalController)
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
      openLoadDataModal: openLoadDataModal,
      openEntityModal: openEntityModal,
      openFlowModal: openFlowModal
    });

    function openLoadDataModal(options) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'top/modal/loadDataModal.html',
        controller: 'loadDataModalController',
        size: 'lg',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          'options': function() {
            return options;
          }
        }
      });

      return modalInstance.result;
    }

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

  function LoadDataModalController($scope, $uibModalInstance, $filter, DataHub, options) {
    $scope.loadDataForm = options;
    $scope.mlcpInitialCommand = '';
    $scope.mlcpCommand = '';
    $scope.groups = [];
    
    $scope.ok = function() {
      $uibModalInstance.close($scope.loadDataForm);
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss();
    };
    
    $scope.download = function() {
      $scope.loading = true;
      DataHub.downloadMlcpOptionsFile($scope.loadDataForm)
        .success(function(data) {
          var anchor = angular.element('<a/>');
          anchor.attr({
            href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
            target: '_blank',
            download: 'mlcpOptions.txt'
          })[0].click();
        })
        .then(function() {
          $scope.loading = false;
        });
    };

    $scope.onSelection = function(node, selected) {
      $scope.loadDataForm.inputPath = node.path;
    };

    $scope.onNodeToggle = function(node, expanded) {
      if (expanded) {
        $scope.searchPath(node.path, node);
      }
    };

    function isLeaf(node) {
      return false;
    }

    $scope.treeOptions = {
      nodeChildren: 'children',
      dirSelectable: true,
      multiSelection: false,
      isLeaf: isLeaf,
      injectClasses: {
        ul: 'a1',
        li: 'a2',
        liSelected: 'a7',
        iExpanded: 'a3',
        iCollapsed: 'a4',
        iLeaf: 'a5',
        label: 'a6',
        labelSelected: 'a8'
      }
    };

    $scope.searchPath = function(basePath, node) {
      DataHub.searchPath(basePath).success(function(data) {
        $scope.updateMlcpCommand();
        $scope.loadTree(data, node);
      });
    };
    
    $scope.loadTree = function(data, node) {
      if (node == null) { // jshint ignore:line
        //initialize root
        $scope.dataForTheTree = data.paths.slice();
      } else {
        node.children = data.paths;
      }
      $scope.showInputPathTreeBrowser = true;
    };
    
    $scope.searchPathThenHideTree = function(basePath, node) {
      DataHub.searchPath(basePath).success(function(data) {
        $scope.loadTree(data, node);
      })
      .then(function() {
        $scope.showInputPathTreeBrowser = false;
      });
    };
    
    $scope.dataForTheTree = [];
    
    $scope.searchPathThenHideTree($scope.loadDataForm.inputPath);
    $scope.mlcpInitialCommand = constructInitialMlcpCommand(DataHub);
    
    $scope.updateMlcpCommand = function() {
      $scope.mlcpCommand = updateMlcpCommand($scope.mlcpInitialCommand, $scope.loadDataForm, $scope.groups);
    };
    
    $scope.loadSettings = function() {
      DataHub.getJsonFile('/json/inputOptions.json')
        .success(function(data) {
          var updatedData = JSON.stringify(data).replace(/{{entityName}}/g, $scope.loadDataForm.entityName)
            .replace(/{{flowName}}/g, $scope.loadDataForm.flowName);
          var jsonObj = $.parseJSON(updatedData);
          $scope.groups = jsonObj.groups;
          //load previous settings to $scope.groups based on $scope.loadDataForm.otherOptions
          updateGroupsBasedOnPreviousSettings($scope.groups, $scope.loadDataForm.otherOptions);
          addReadOnlyLengthToGroupSettingWithDefaultValue($scope.groups);
        })
        .then(function () {
          $scope.updateMlcpCommand();
        });
    };
    
    $scope.loadSettings();
    
    $scope.isText = function(type) {
      if(type === 'string' || type === 'comma-list' || type === 'number' || type === 'character') {
        return true;
      } else {
        return false;
      }
    };
    
    $scope.hideInputPathTreeBrowser = function() {
      $scope.showInputPathTreeBrowser = false;
    };
    
    $scope.showBasedOnCategoryAndInputFileType = function(category, inputFileType) {
      return showBasedOnCategoryAndInputFileType(category, inputFileType);
    };
    
    $scope.showIfHasNoFilterFieldOrWithSpecifiedValue = function(field,value,collection) {
      if(angular.isUndefined(field) || $filter('GetByFieldAndValue')(field,value,collection)) {
        return true;
      }
      return false;
    };
    
    $scope.makeDefaultValueReadOnlyIfApplicable = function($event) {
      var elem = $event.currentTarget;
      var readOnlyLengthData = elem.getAttribute("data-read-only-length");
      if(readOnlyLengthData) {
    	var readOnlyLength = parseInt(readOnlyLengthData);
        if (($event.which != 37 && ($event.which != 39))
    	  && ((elem.selectionStart < readOnlyLength)
    	  || ((elem.selectionStart === readOnlyLength) && ($event.which === 8)))) {
          $event.preventDefault();
    	  return false;  
    	}	
      }
    };
  }
  
  /*
   * update $scope.groups and add a ReadOnlyLength 
   * for options with default value to disable removal of default value 
   * for options with type 'comma-list', set it to the length of the default value
   * for options with type 'string', set it to -1 which means it should be readonly
   */
  function addReadOnlyLengthToGroupSettingWithDefaultValue(groups) {
    $.each(groups, function(i, group) {
      $.each(group.settings, function(i, setting) {
        if(setting.Value) {
          if(setting.Type === 'comma-list') {
            setting.ReadOnlyLength = setting.Value.length;
          } else if(setting.Type === 'string') {
            setting.ReadOnlyLength = -1;
	      }
        }
      });
    });
  }
  
  function updateGroupsBasedOnPreviousSettings(groups, otherOptions) {
    if(otherOptions !== null) {
      var optionsMap = $.parseJSON(otherOptions);
      $.each(groups, function(i, group) {
        $.each(group.settings, function(i, setting) {
          if(optionsMap[setting.Field]) {
            var value = optionsMap[setting.Field].replace(/"/g, '');
            setting.Value = value;
          }
        });
      });
    }
  }
  
  function showBasedOnCategoryAndInputFileType(category, inputFileType) {
    if(category === 'Delimited text options' && inputFileType !== 'delimited_text') {
      return false;
    } else if(category === 'Aggregate XML options' && inputFileType !== 'aggregates') {
      return false;
    }
    return true;
  }
  
  function constructInitialMlcpCommand(DataHub) {
    var mlcpCommand = 'mlcp';
    var mlcpExtension = '.sh';
    if ( navigator.appVersion.indexOf('Win') !== -1 ) {
      mlcpExtension = '.bat';
    }
    mlcpCommand += mlcpExtension + ' import -mode local';
    mlcpCommand += ' -host ' + DataHub.status.mlHost;
    mlcpCommand += ' -port ' + DataHub.status.mlStagingRestPort;
    mlcpCommand += ' -username ' + DataHub.status.mlUsername;
    mlcpCommand += ' -password ' + DataHub.status.mlPassword;
    return mlcpCommand;
  }
  
  function updateMlcpCommand(initialMlcpCommand, loadDataForm, groups) {
    var mlcpCommand = initialMlcpCommand;
    mlcpCommand += ' -input_file_path ' + loadDataForm.inputPath;
    mlcpCommand += ' -input_file_type ' + loadDataForm.inputFileType;
    mlcpCommand += ' -output_uri_replace "' + loadDataForm.inputPath + ',\'\'"';
    
    var otherOptions = [];
    $.each(groups, function(i, group) {
      if(showBasedOnCategoryAndInputFileType(group.category, loadDataForm.inputFileType)) {
        $.each(group.settings, function(i, setting) {
          if(setting.Value) {
            var key = setting.Field;
            var value = '"' + setting.Value + '"';
            mlcpCommand += ' ' + key + ' ' + value;
            var option = {};
            option[key] = value;
            otherOptions.push(option);
          }
        });
      }
    });
	
    loadDataForm.otherOptions = otherOptions.length > 0 ? JSON.stringify(otherOptions) : null;
    return mlcpCommand;
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
