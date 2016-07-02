import {Injectable, Input, Inject} from 'ng-forward';

import * as _ from 'lodash';

@Injectable()
@Inject('$scope', '$mdDialog', 'flowType')

export class NewFlow {
  pluginFormats = [
    { label: 'Javascript', value: 'JAVASCRIPT' },
    { label: 'XQuery', value: 'XQUERY' },
  ];
  dataFormats = [
    { label: 'JSON', value: 'JSON' },
    { label: 'XML', value: 'XML' },
  ];

  flow = {};

  constructor($scope, $mdDialog, flowType) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.flowType = _.capitalize(flowType);

    this.flow.pluginFormat = this.pluginFormats[0];
    this.dataFormat = this.dataFormats[0];
  }

  create() {
    this.$mdDialog.hide(this.flow);
  }

  cancel() {
    this.$mdDialog.cancel();
  }
}
