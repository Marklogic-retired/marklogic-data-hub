import { Component, Input, Inject, EventEmitter,
trigger, state, style, transition, animate } from '@angular/core';

import { SelectList } from '../select-list/select-list.component';

import * as _ from 'lodash';

@Component({
  selector: 'new-entity',
  templateUrl: './new-entity.html',
  styleUrls: ['./new-entity.css'],
  directives: [SelectList]
})
export class NewEntity {
  finishedEvent: EventEmitter<any>;
  _isVisible: boolean = false;

  pluginFormats = [
    { label: 'Javascript', value: 'JAVASCRIPT' },
    { label: 'XQuery', value: 'XQUERY' },
  ];
  dataFormats = [
    { label: 'JSON', value: 'JSON' },
    { label: 'XML', value: 'XML' },
  ];

  DEFAULTENTITY: any = {
    inputFlows: [],
    harmonizeFlows: []
  };

  entity: any = _.clone(this.DEFAULTENTITY);

  constructor() {}

  show() {
    this.entity = _.clone(this.DEFAULTENTITY);
    this.finishedEvent = new EventEmitter<boolean>(true);
    this._isVisible = true;
    return this.finishedEvent;
  }

  hide() {
    this._isVisible = false;
  }

  private newInputFlow() {
    this.entity.inputFlows.push({});
  }

  private newHarmonizeFlow() {
    this.entity.harmonizeFlows.push({});
  }

  private create() {
    if (this.entity.entityName && this.entity.entityName.length > 0) {
      this.hide();
      this.finishedEvent.emit(this.entity);
    }
  }

  private cancel() {
    this.hide();
    this.finishedEvent.error(false);
  }
}
