import {Injectable, Input, Inject} from 'ng-forward';

@Injectable()
@Inject('$scope', '$mdDialog')

export class NewEntity {
  pluginFormats = [
    { label: 'Javascript', value: 'JAVASCRIPT' },
    { label: 'XQuery', value: 'XQUERY' },
  ];
  dataFormats = [
    { label: 'JSON', value: 'JSON' },
    { label: 'XML', value: 'XML' },
  ];

  entity = {
    inputFlows: [
      {},
    ],
    harmonizeFlows: [
      {},
    ],
  };

  constructor($scope, $mdDialog) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;

    this.entity.pluginFormat = this.pluginFormats[0];
    this.entity.dataFormat = this.dataFormats[0];
  }

  create() {
    this.$mdDialog.hide(this.entity);
  }

  cancel() {
    this.$mdDialog.cancel();
  }
}
