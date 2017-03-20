import { Component, HostListener, Inject } from '@angular/core';

import { MdlDialogReference } from 'angular2-mdl';

import * as _ from 'lodash';

@Component({
  selector: 'app-new-entity',
  templateUrl: './new-entity.html',
  styleUrls: ['./new-entity.scss']
})
export class NewEntityComponent {
  actions: any;

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

  constructor(
    private dialog: MdlDialogReference,
    @Inject('actions') actions: any
  ) {
    this.entity = _.clone(this.DEFAULTENTITY);
    this.actions = actions;
  }

  hide() {
    this.dialog.hide();
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
      if (this.actions && this.actions.save) {
        this.actions.save(this.entity);
      }
    }
  }

  cancel() {
    this.hide();
  }
}
