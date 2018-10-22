import { Component, HostListener, Inject, ViewChild } from '@angular/core';

import { MdlDialogReference, MdlDialogComponent } from '@angular-mdl/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-new-entity',
  templateUrl: './new-entity.component.html',
  styleUrls: ['./new-entity.component.scss']
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
    info: {
      title: null
    }
  };

  entity: any = _.clone(this.DEFAULTENTITY);
  @ViewChild('newEntityDialog') private  newEntityDialog: MdlDialogComponent;
  constructor(
    // private dialog: MdlDialogReference,
    // @Inject('actions') actions: any
  ) {
    this.entity = _.clone(this.DEFAULTENTITY);
    //this.actions = actions;
  }

  hide() {
    //this.dialog.hide();
  }

  create() {
    if (this.entity.info.title && this.entity.info.title.length > 0) {
      this.hide();
      if (this.actions && this.actions.save) {
        this.actions.save(this.entity);
      }
    }
  }

  // cancel() {
  //   this.hide();
  // }
}
