import { Component, EventEmitter, ViewChild } from '@angular/core';

import { SelectListComponent } from '../select-list/select-list.component';

import * as _ from 'lodash';

@Component({
  selector: 'app-new-flow',
  templateUrl: './new-flow.html',
  styleUrls: ['./new-flow.scss']
})
export class NewFlowComponent {
  @ViewChild('pluginFormatList') pluginFormatList: SelectListComponent;
  @ViewChild('dataFormatList') dataFormatList: SelectListComponent;

  finishedEvent: EventEmitter<any>;
  _isVisible: boolean = false;

  flowType: string;

  pluginFormats = [
    { label: 'Javascript', value: 'JAVASCRIPT' },
    { label: 'XQuery', value: 'XQUERY' },
  ];
  dataFormats = [
    { label: 'JSON', value: 'JSON' },
    { label: 'XML', value: 'XML' },
  ];

  emptyFlow = {
    flowName: <string>null,
    pluginFormat: 'JAVASCRIPT',
    dataFormat: 'JSON'
  };

  flow = _.clone(this.emptyFlow);

  dataFormat: any;

  constructor() {}

  show(flowType: string) {
    this.pluginFormatList.selectInitial();
    this.dataFormatList.selectInitial();
    this.flowType = _.capitalize(flowType);
    this.flow = _.clone(this.emptyFlow);
    this.finishedEvent = new EventEmitter<boolean>(true);
    this._isVisible = true;
    return this.finishedEvent;
  }

  hide() {
    this._isVisible = false;
  }

  create() {
    if (this.flow.flowName && this.flow.flowName.length > 0) {
      this.hide();
      this.finishedEvent.emit(this.flow);
    }
  }

  cancel() {
    this.hide();
    this.finishedEvent.error(false);
  }
}
