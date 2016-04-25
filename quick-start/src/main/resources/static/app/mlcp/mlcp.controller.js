/* jshint camelcase: false */
(function () {

  'use strict';

  angular.module('mlcp')
    .controller('MlcpController', MlcpController);

  function MlcpController($scope, $uibModalInstance, $filter,
    DataHub, mlcpGroups, entityName, flowName, mlcpOptions) {

    var self = this;
    angular.extend(self, {
      ok: ok,
      cancel: cancel,
      download: download,
      onNodeToggle: onNodeToggle,
      isGroupVisible: isGroupVisible,
      isFieldVisible: isFieldVisible,
      hideFileTree: hideFileTree,
      isText: isText,
      dataForTheTree: [],
      groups: mlcpGroups.groups(entityName, flowName, mlcpOptions),
      treeOptions: {
        nodeChildren: 'children',
        dirSelectable: false,
        multiSelection: false,
        isLeaf: isLeaf
      }
    });

    $scope.mlcp = angular.extend({
      input_file_type: 'documents',
    }, mlcpOptions);

    function ok() {
      if($scope.mlcp.input_file_path) {
        $uibModalInstance.close($scope.mlcp);
      }
    }

    function cancel() {
      $uibModalInstance.dismiss();
    }

    function download() {
      var txt = buildMlcpOptions().join('\n');
      var hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:attachment/text,' + encodeURI(txt);
      hiddenElement.target = '_blank';
      hiddenElement.download = 'mlcpOptions.txt';
      hiddenElement.click();
    }

    function searchPath(basePath) {
      DataHub.searchPath(basePath).success(function(data) {
        self.dataForTheTree = data.paths.slice();
      });
    }

    function onNodeToggle(node, expanded) {
      $scope.mlcp.input_file_path = node.path;
    }

    function isLeaf(node) {
      return false;
    }

    function hideFileTree() {
      $scope.showInputPathTreeBrowser = false;
    }

    function isGroupVisible(category) {
      if(category === 'Delimited Text Options' && $scope.mlcp.input_file_type !== 'delimited_text') {
        return false;
      }
      else if(category === 'Aggregate XML Options' && $scope.mlcp.input_file_type !== 'aggregates') {
        return false;
      }
      return true;
    }

    function isFieldVisible(filter, collection) {
      if (filter) {
        var field = filter.field;
        var value = filter.value;
        return getByFieldAndValue(field, value, collection);
      }
      return true;
    }

    function getByFieldAndValue(field, value, collection) {
      var i = 0, len = collection.length;
      for (; i<len; i++) {
        if (String(collection[i].field) === String(field) &&
            String(collection[i].value) === String(value)) {
          return collection[i];
        }
      }
      return null;
    }


    function isText(type) {
      if(type === 'string' || type === 'comma-list' || type === 'number' || type === 'character') {
        return true;
      }
      else {
        return false;
      }
    }

    function buildMlcpOptions() {
      var options = [];
      var inputFilePath = $scope.mlcp.input_file_path;
      var input_file_type = $scope.mlcp.input_file_type;
      $scope.mlcp = {};
      addMlcpOption(options, 'import', null, false);
      addMlcpOption(options, 'mode', 'local', false);
      addMlcpOption(options, 'host', DataHub.status.mlHost, false);
      addMlcpOption(options, 'port', DataHub.status.mlStagingPort, false);
      addMlcpOption(options, 'username', DataHub.status.mlUsername, false);
      addMlcpOption(options, 'password', DataHub.status.mlPassword, false);
      addMlcpOption(options, 'input_file_path', inputFilePath, true);
      addMlcpOption(options, 'input_file_type', input_file_type, true);
      addMlcpOption(options, 'output_uri_replace', '"' + inputFilePath + ',\'\'"', true);

      angular.forEach(self.groups, function(group) {
        if (isGroupVisible(group.category)) {
          $.each(group.settings, function(i, setting) {
            if (setting.value) {
              var key = setting.field;
              var value = setting.value;
              if (setting.type !== 'boolean') {
                value = '"' + setting.value + '"';
              }
              addMlcpOption(options, key, value, true);
            }
          });
        }
      });
      return options;
    }

    function addMlcpOption(options, key, value, isOtherOption) {
      options.push('-' + key);
      if(value) {
        options.push(value);
        if(isOtherOption) {
          $scope.mlcp[key] = value;
        }
      }
    }

    function updateMlcpCommand() {
      var mlcpCommand = 'mlcp';
      mlcpCommand += (navigator.appVersion.indexOf('Win') !== -1) ? '.bat' : '.sh';

      mlcpCommand += ' ' + buildMlcpOptions().join(' ');

      self.mlcpCommand = mlcpCommand;
      return mlcpCommand;
    }

    $scope.$watch('mlcp.input_file_path', function(value) {
      if(value) {
        searchPath(value);
      }
    });

    $scope.$watch('mlcp', function(value) {
      updateMlcpCommand();
    }, true);

    $scope.$watch('ctrl.groups', function(value) {
      updateMlcpCommand();
    }, true);
  }

})();
