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
  mapName: string = '';
  mapDesc: string = '';
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

  ngOnInit() {

  }


  hide() {
    this.dialog.hide();
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.cancel();
  }

  nameEmpty() {
    let result = true;
    if (this.mapName) {
      result = this.mapName.length === 0;
    }
    return result;
  }

  nameDuplicate() {
    let result;
    if (this.mappings && this.mapName) {
      let name = this.mapName;
      result =  _.findIndex(this.mappings, function(m) { return m.name === name; });
    }
    return result > -1;
  }

  create() {
    if (!this.nameEmpty() && !this.nameDuplicate()) {
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
