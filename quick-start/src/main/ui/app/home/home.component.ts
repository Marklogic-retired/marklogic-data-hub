import { Component, Input, ViewChild } from '@angular/core';

import { Entity } from '../entities/entity.model';
import { Flow } from '../entities/flow.model';

import { EntitiesService } from '../entities/entities.service';

import { MlcpUi } from '../mlcp-ui';
import { NewEntity } from '../new-entity/new-entity';
import { NewFlow } from '../new-flow/new-flow';

import * as _ from 'lodash';

@Component({
  selector: 'home',
  templateUrl: './home.template.html',
  directives: [MlcpUi, NewEntity, NewFlow],
  providers: [],
  styleUrls: ['./home.style.scss'],
})
export class Home {
  @ViewChild(MlcpUi) mlcp: MlcpUi;
  @ViewChild(NewEntity) newEntity: NewEntity;
  @ViewChild(NewFlow) newFlow: NewFlow;

  entities: Array<Entity>;
  entity: Entity;
  flow: Flow;
  flowType: string;

  collapsedMap: Map<string, boolean> = new Map<string, boolean>();

  mlcpProgressHidden: boolean = true;
  mlcpPercentComplete: number;
  mlcpStatus: string;

  constructor(private entitiesService: EntitiesService) {
    entitiesService.entityMessageEmitter.subscribe(path => {
      this.getEntities();
    });
    this.getEntities();
  }

  isCollapsed(entity: Entity) {
    return this.collapsedMap.get(entity.entityName);
  }

  getEntities() {
    this.entitiesService.getEntities().subscribe(entities => {
      this.entities = entities;
      _.each(this.entities, entity => {
        let previous = this.collapsedMap.get(entity.entityName);
        if (_.isUndefined(previous)) {
          previous = true;
        }
        this.collapsedMap.set(entity.entityName, previous);
      });
    });
  }

  setEntity(entity) {
    const collapsed = this.collapsedMap.get(entity.entityName);

    _.each(this.entities, e => { this.collapsedMap.set(e.entityName, true); });
    this.collapsedMap.set(entity.entityName, !collapsed);
  }

  setFlow(entity, flow, flowType) {
    this.entity = entity;
    this.flow = flow;
    this.flowType = flowType;
  }

  isActiveEntity(entity) {
    if (this.entity === entity) {
      return 'active';
    }
    return '';
  }

  showNewEntity(ev) {
    this.newEntity.show().subscribe(newEntity => {
      this.entitiesService.createEntity(newEntity).subscribe(entity => {
        this.entities.push(entity);
      });
    });
  }

  newInputFlow(ev, entity: Entity) {
    return this.showNewFlow(ev, entity, 'INPUT');
  }

  newHarmonizeFlow(ev, entity: Entity) {
    return this.showNewFlow(ev, entity, 'HARMONIZE');
  }

  showNewFlow(ev, entity: Entity, flowType) {
    this.newFlow.show(flowType).subscribe(newFlow => {
      this.entitiesService.createFlow(entity, flowType, newFlow).subscribe(flow => {
        if (flowType === 'INPUT') {
          entity.inputFlows.push(flow);
        } else if (flowType === 'HARMONIZE') {
          entity.harmonizeFlows.push(flow);
        }
      });
    });
  }

  runInputFlow(ev: Event, flow) {
    this.mlcpStatus = '';
    this.entitiesService.mlcpMessageEmitter.subscribe((payload) => {
      this.mlcpPercentComplete = payload.percentComplete;
      this.mlcpStatus += '\n' + payload.message;

      if (this.mlcpPercentComplete === 100) {
        setTimeout(() => {
          this.mlcpProgressHidden = true;
        }, 1000);
      }
    });
    this.entitiesService.getInputFlowOptions(flow).subscribe(mlcpOptions => {
      this.mlcp.show(mlcpOptions, flow, ev).subscribe((options) => {
        this.entitiesService.runInputFlow(flow, options);
      });
    });
    ev.stopPropagation();
  }

  runHarmonizeFlow(flow) {
    this.entitiesService.runHarmonizeFlow(flow);
  }
}
