import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Entity } from '../../../models/index';
import { MdlDialogService } from '@angular-mdl/core';

import * as _ from 'lodash';
import {Mapping} from "../mapping.model";
import {Subscriber} from "rxjs";


@Component({
  selector: 'app-mappings-ui',
  templateUrl: './mappings-ui.component.html',
  styleUrls: ['./mappings-ui.component.scss']
})
export class MappingsUiComponent {

  @Input() entities: Array<Entity> = new Array<Entity>();
  @Input() entityMappingsMap: Map<Entity, Array<Mapping>> = new Map<Entity, Array<Mapping>>();

  @Output() showNewMapping = new EventEmitter();
  @Output() editMapping = new EventEmitter();
  @Output() deleteMapping = new EventEmitter();

  public subscribers: Map<string, Subscriber<any>> = new Map();

  private activeEntity: Entity;
  private activeMapping: Mapping;
  public flowName: string;

  private entitiesLoaded: boolean = false;

  public mappings: Array<Mapping> = [];

  private entityMap: Map<string, Entity> = new Map<string, Entity>();

  constructor(
    private dialogService: MdlDialogService
  ) {}

  isActiveMap(entity: Entity, mapping: Mapping): boolean {
    return this.activeEntity && this.activeEntity.name === entity.name &&
      this.activeMapping && this.activeMapping.name === mapping.name;
  }

  onShowNewMapping(entity: Entity, mappings: Array<Mapping>) {
    this.showNewMapping.emit({entity: entity, mappings: mappings});
  }

  onEditMapping(entity: Entity, mapping: Mapping){
    this.activeEntity = entity;
    this.activeMapping = mapping;
    this.editMapping.emit({entity: entity, mapping: mapping});
  }

  onDeleteMapping(event: MouseEvent, mapping: Mapping): void {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.cancelBubble = true;
    this.dialogService.confirm(`Really delete ${mapping.name} mapping?`, 'Cancel', 'Delete').subscribe(() => {
        this.deleteMapping.emit({event: event, mapping: mapping});
      },
      () => {});
  }

}
