import { Component, Inject } from '@angular/core';

import { MdlDialogReference } from '@angular-mdl/core';

import { EnvironmentService } from '../../services/environment';

import * as _ from 'lodash';
import {MapService} from "./map.service";
import {Mapping} from "./mapping.model";
import {Entity} from "../../models";

@Component({
  selector: 'app-new-map',
  template: `
    <app-new-map-ui
      [mappings]="this.mappings"
      (create)="this.create($event)" 
      (cancel)="this.cancel()"
    ></app-new-map-ui>
  `
})
export class NewMapComponent {
  actions: any;
  entity: Entity;
  mappings: Array<Mapping>;

  constructor(
    private dialog: MdlDialogReference,
    private envService: EnvironmentService,
    private mapService: MapService,
    @Inject('actions') actions: any,
    @Inject('entity') entity: Entity,
    @Inject('mappings') mappings: Array<Mapping>
  ) {
    this.actions = actions;
    this.entity = entity;
    this.mappings = mappings;
  }

  hide() {
    this.dialog.hide();
  }

  create(event) {
    this.hide();
    if (this.actions && this.actions.save) {
      this.actions.save(event.mapName, event.mapDesc);
    }
  }

  cancel() {
    this.hide();
  }

}
