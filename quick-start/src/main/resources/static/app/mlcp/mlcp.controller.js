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
      groups: mlcpGroups.groups(entityName, flowName),
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
      $uibModalInstance.close($scope.mlcp);
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
      } else if(category === 'Aggregate XML Options' && $scope.mlcp.input_file_type !== 'aggregates') {
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
      options.push('import');
      options.push('-mode');
      options.push('local');
      options.push('-host');
      options.push(DataHub.status.mlHost);
      options.push('-port');
      options.push(DataHub.status.mlStagingPort);
      options.push('-username');
      options.push(DataHub.status.mlUsername);
      options.push('-password');
      options.push(DataHub.status.mlPassword);

      options.push('-input_file_path');
      options.push($scope.mlcp.input_file_path);
      options.push('-input_file_type');
      options.push($scope.mlcp.input_file_type);
      options.push('-output_uri_replace');
      options.push('"' + $scope.mlcp.input_file_path + ',\'\'"');

      angular.forEach(self.groups, function(group) {
        if (isGroupVisible(group.category)) {
          $.each(group.settings, function(i, setting) {
            if (setting.value) {
              var key = setting.field;
              var value = setting.value;
              if (setting.type !== 'boolean') {
                value = '"' + setting.value + '"';
              }
              options.push('-' + key);
              options.push(value);
            }
          });
        }
      });
      return options;
    }

    function updateMlcpCommand() {
      var mlcpCommand = 'mlcp';
      mlcpCommand += (navigator.appVersion.indexOf('Win') !== -1) ? '.bat' : '.sh';

      mlcpCommand += ' ' + buildMlcpOptions().join(' ');

      self.mlcpCommand = mlcpCommand;
      return mlcpCommand;
    }

    $scope.$watch('mlcp.input_file_path', function(value) {
      searchPath(value);
    });

    $scope.$watch('mlcp', function(value) {
      updateMlcpCommand();
    }, true);

    $scope.$watch('ctrl.groups', function(value) {
      updateMlcpCommand();
    }, true);
  }

})();
