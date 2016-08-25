import { Component, Input, Inject, EventEmitter, OnInit, ViewChild,
trigger, state, style, transition, animate } from '@angular/core';

import { SelectList } from '../select-list/select-list.component';

import * as _ from 'lodash';

@Component({
  selector: 'new-flow',
  templateUrl: './new-flow.html',
  styleUrls: ['./new-flow.css'],
  directives: [SelectList]
})
export class NewFlow {
  @ViewChild('pluginFormatList') pluginFormatList: SelectList;
  @ViewChild('dataFormatList') dataFormatList: SelectList;

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

  private create() {
    if (this.flow.flowName && this.flow.flowName.length > 0) {
      this.hide();
      this.finishedEvent.emit(this.flow);
    }
  }

  private cancel() {
    this.hide();
    this.finishedEvent.error(false);
  }
}
