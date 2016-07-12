import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Entity } from '../entities/entity.model';

import { EntitiesService } from '../entities/entities.service';

import { MlcpUi } from '../mlcp-ui';
import { NewEntity } from '../new-entity/new-entity';
import { NewFlow } from '../new-flow/new-flow';

import { STOMPService } from '../stomp/stomp.service';


@Component({
  selector: 'home',
  templateUrl: './home.template.html',
  directives: [MlcpUi, NewEntity, NewFlow],
  providers: [EntitiesService, STOMPService],
  styleUrls: ['./home.style.scss'],
})
export class Home {
  @ViewChild(MlcpUi) mlcp: MlcpUi;
  @ViewChild(NewEntity) newEntity: NewEntity;
  @ViewChild(NewFlow) newFlow: NewFlow;

  entities: Array<Entity>;
  entity: Entity;

  mlcpProgressHidden: boolean = true;
  mlcpPercentComplete: number;
  mlcpStatus: string;

  constructor(
    private entitiesService: EntitiesService,
    private router: Router
  ) {
    this.entitiesService.getEntities().subscribe(entities => {
      this.entities = entities;
      if (this.entities.length > 0) {
        this.setEntity(this.entities[0]);
      }
    },
    error => {
      if (error.status === 401) {
        this.router.navigate(['login']);
      }
    });
  }

  setEntity(entity) {
    this.entity = entity;
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

  newInputFlow(ev) {
    return this.showNewFlow(ev, 'INPUT');
  }

  newHarmonizeFlow(ev) {
    return this.showNewFlow(ev, 'HARMONIZE');
  }

  showNewFlow(ev, flowType) {
    this.newFlow.show().subscribe(newFlow => {
      this.entitiesService.createFlow(this.entity, flowType, newFlow).subscribe(flow => {
        if (flowType === 'INPUT') {
          this.entity.inputFlows.push(flow);
        } else if (flowType === 'HARMONIZE') {
          this.entity.harmonizeFlows.push(flow);
        }
      });
    });
  }

  runInputFlow(ev, flow) {
    this.mlcpStatus = '';
    this.entitiesService.messageEmitter.subscribe((payload) => {
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
        console.log('mlcp result!' + JSON.stringify(options));
        this.entitiesService.runInputFlow(flow, options);
      });
    });
  }

  runHarmonizeFlow(flow) {
    this.entitiesService.runHarmonizeFlow(flow);
  }
}
