import { Component, HostListener, Inject } from '@angular/core';

import { MdlDialogReference } from '@angular-mdl/core';

import { EnvironmentService } from '../environment';

import * as _ from 'lodash';
import {MapService} from "../mappings/map.service";
import {Mapping} from "../mappings/mapping.model";
import {Entity} from "../entities";

@Component({
  selector: 'app-new-map',
  templateUrl: './new-map.component.html',
  styleUrls: ['./new-map.component.scss']
})
export class NewMapComponent {
  actions: any;
  entity: Entity;
  mapName: string;
  mapDesc: string = '';

  constructor(
    private dialog: MdlDialogReference,
    private envService: EnvironmentService,
    private mapService: MapService,
    @Inject('actions') actions: any,
    @Inject('entity') entity: Entity
  ) {
    this.actions = actions;
    this.entity = entity;
  }

  ngOnInit() {

  }


  hide() {
    this.dialog.hide();
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.cancel();
  }

  create() {
    if (this.mapName && this.mapName.length > 0) {
      this.hide();
      if (this.actions && this.actions.save) {
        this.actions.save(this.mapName, this.mapDesc);
      }
    }
  }

  cancel() {
    this.hide();
  }

}
