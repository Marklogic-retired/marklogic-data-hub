import { Component, EventEmitter } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-new-entity',
  templateUrl: './new-entity.html',
  styleUrls: ['./new-entity.scss']
})
export class NewEntityComponent {
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

  newInputFlow() {
    this.entity.inputFlows.push({});
  }

  newHarmonizeFlow() {
    this.entity.harmonizeFlows.push({});
  }

  create() {
    if (this.entity.entityName && this.entity.entityName.length > 0) {
      this.hide();
      this.finishedEvent.emit(this.entity);
    }
  }

  cancel() {
    this.hide();
    this.finishedEvent.error(false);
  }
}
