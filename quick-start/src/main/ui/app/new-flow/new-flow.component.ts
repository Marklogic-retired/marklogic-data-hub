import { Component, HostListener, Inject } from '@angular/core';

import { MdlDialogReference } from '@angular-mdl/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-new-flow',
  templateUrl: './new-flow.component.html',
  styleUrls: ['./new-flow.component.scss']
})
export class NewFlowComponent {
  flowType: string;
  actions: any;

  scaffoldOptions = [
    { label: 'Create Structure from Entity Definition', value: true },
    { label: 'Blank Template', value: false }
  ];
  pluginFormats = [
    { label: 'Javascript', value: 'JAVASCRIPT' },
    { label: 'XQuery', value: 'XQUERY' }
  ];
  dataFormats = [
    { label: 'JSON', value: 'JSON' },
    { label: 'XML', value: 'XML' }
  ];

  startingScaffoldOption: any = null;

  emptyFlow = {
    flowName: <string>null,
    pluginFormat: 'JAVASCRIPT',
    dataFormat: 'JSON',
    useEsModel: true
  };

  flow = _.clone(this.emptyFlow);

  dataFormat: any;

  constructor(
    private dialog: MdlDialogReference,
    @Inject('flowType') flowType: string,
    @Inject('actions') actions: any
  ) {
    this.flowType = _.capitalize(flowType);
    this.flow = _.clone(this.emptyFlow);
    this.actions = actions;

    if (flowType === 'INPUT') {
      this.startingScaffoldOption = this.scaffoldOptions[1];
    } else {
      this.startingScaffoldOption = this.scaffoldOptions[0];
    }
  }

  hide() {
    this.dialog.hide();
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.cancel();
  }

  create() {
    if (this.flow.flowName && this.flow.flowName.length > 0) {
      this.hide();
      if (this.actions && this.actions.save) {
        this.actions.save(this.flow);
      }
    }
  }

  cancel() {
    this.hide();
  }
}
