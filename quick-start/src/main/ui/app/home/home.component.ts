import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';

import { TimeAgoPipe } from 'angular2-moment';
import { Entity } from '../entities/entity.model';
import { Flow } from '../entities/flow.model';
import { TooltipDirective } from '../tooltip/tooltip.directive';

import { EntitiesService } from '../entities/entities.service';

import { MdlSnackbarService } from 'angular2-mdl';

import { MdDialog, MdDialogConfig, MdDialogRef } from '../dialog/dialog';

import { MlcpUi } from '../mlcp-ui/index';
import { NewEntity } from '../new-entity/new-entity';
import { NewFlow } from '../new-flow/new-flow';
import { DeployService } from '../deploy/deploy.service';

import * as _ from 'lodash';

@Component({
  selector: 'home',
  templateUrl: './home.template.html',
  directives: [MlcpUi, NewEntity, NewFlow, TooltipDirective],
  pipes: [TimeAgoPipe],
  providers: [],
  styleUrls: ['./home.style.css'],
})
export class Home {
  @ViewChild(MlcpUi) mlcp: MlcpUi;
  @ViewChild(NewEntity) newEntity: NewEntity;
  @ViewChild(NewFlow) newFlow: NewFlow;

  entities: Array<Entity>;
  entity: Entity;
  flow: Flow;
  flowType: string;
  config: MdDialogConfig = new MdDialogConfig();

  constructor(
    private entitiesService: EntitiesService,
    private deployService: DeployService,
    private snackbar: MdlSnackbarService,
    private dialog: MdDialog,
    private vcRef: ViewContainerRef
  ) {
    let vref: any = vcRef;
    snackbar.setDefaultViewContainerRef(vref);
    this.config.viewContainerRef = this.vcRef;

    deployService.onDeploy.subscribe(() => {
      this.getEntities();
    });
    this.getEntities();
    this.deployService.validateUserModules();
  }

  getLastDeployed() {
    return this.deployService.getLastDeployed();
  }

  getErrors() {
    return this.deployService.errors;
  }

  hasErrors(): boolean {
    let errors = this.getErrors();
    return !!(errors && _.keys(errors).length > 0)
  }

  entityHasError(entityName: string): boolean {
    let errors = this.getErrors();
    return !!(errors && errors[entityName]);
  }

  flowHasError(entityName: string, flowName: string): boolean {
    let errors = this.getErrors();
    return !!(errors && errors[entityName] && errors[entityName][flowName]);
  }

  pluginHasError(flow: Flow, pluginType: string) {
    let errors = this.getErrors();
    return !!(
      errors &&
      errors[flow.entityName] &&
      errors[flow.entityName][flow.flowName] &&
      errors[flow.entityName][flow.flowName][pluginType]
    );
  }

  getErrorMessage(flow: Flow, pluginType: string) {
    let errors = this.getErrors();
    let o = errors[flow.entityName][flow.flowName][pluginType];
    return `ERROR:\n${o.msg}\n\nat\n\n${o.uri}:${o.line}:${o.column}`;
  }

  isCollapsed(entity: Entity): boolean {
    let collapsed: string = localStorage.getItem(entity.entityName + '-collapsed');
    if (collapsed === null) {
      collapsed = 'true';
    }
    return collapsed === 'true';
  }

  setCollapsed(entity: Entity, collapsed: boolean): void {
    localStorage.setItem(entity.entityName + '-collapsed', collapsed.toString());
  }

  getEntities(): void {
    this.entitiesService.getEntities().subscribe(entities => {
      this.entities = entities;
    });
  }

  toggleEntity(entity: Entity): void {
    const collapsed: boolean = this.isCollapsed(entity);
    _.each(this.entities, e => { this.setCollapsed(e, true); });
    this.setCollapsed(entity, !collapsed);
  }

  setFlow(entity: Entity, flow: Flow, flowType: string): void {
    if (this.mlcp.isVisible()) {
      this.mlcp.cancel();
    }
    this.entity = entity;
    this.flow = flow;
    this.flowType = flowType;
  }

  isActiveFlow(flow: Flow): boolean {
    return this.flow === flow;
  }

  isActiveEntity(entity: Entity): boolean {
    return this.entity === entity;
  }

  showNewEntity(ev: Event): void {
    this.newEntity.show().subscribe((newEntity: Entity) => {
      this.entitiesService.createEntity(newEntity).subscribe((entity: Entity) => {
        this.entities.push(entity);
      });
    });
  }

  newInputFlow(ev: Event, entity: Entity): void {
    this.showNewFlow(ev, entity, 'INPUT');
  }

  newHarmonizeFlow(ev: Event, entity: Entity): void {
    this.showNewFlow(ev, entity, 'HARMONIZE');
  }

  showNewFlow(ev: Event, entity: Entity, flowType: string): void {
    this.newFlow.show(flowType).subscribe((newFlow: Flow) => {
      this.entitiesService.createFlow(entity, flowType, newFlow).subscribe((flow: Flow) => {
        if (flowType === 'INPUT') {
          entity.inputFlows.push(flow);
        } else if (flowType === 'HARMONIZE') {
          entity.harmonizeFlows.push(flow);
        }
      });
    });
  }

  runFlow(ev: MouseEvent, flow: Flow, flowType: string) {
    if (this.flowHasError(flow.entityName, flow.flowName)) {
      this.dialog.open(HasBugsDialog, this.config).then(() => {});
    }
    else {
      const lower = flowType.toLowerCase();
      if (lower === 'input') {
        this.runInputFlow(ev, flow);
      } else if (lower === 'harmonize') {
        this.runHarmonizeFlow(ev, flow);
      }
    }
  }

  runInputFlow(ev: MouseEvent, flow: Flow): void {
    this.entitiesService.getInputFlowOptions(flow).subscribe(mlcpOptions => {
      this.mlcp.show(mlcpOptions, flow, ev).subscribe((options: any) => {
        this.entitiesService.runInputFlow(flow, options);
        this.snackbar.showSnackbar({
          message: flow.entityName + ': ' + flow.flowName + ' starting...',
        });
      });
    });
    ev.stopPropagation();
  }

  runHarmonizeFlow(ev: Event, flow: Flow): void {
    this.entitiesService.runHarmonizeFlow(flow);
    this.snackbar.showSnackbar({
      message: flow.entityName + ': ' + flow.flowName + ' starting...',
    });
    ev.stopPropagation();
  }

  redeployModules() {
    this.deployService.redeployUserModules().subscribe(() => {});
    this.snackbar.showSnackbar({
      message: 'Redeploying Modules...',
    });
  }
}

@Component({
  selector: 'has-bugs-dialog',
  template: `
  <h3 class="bug-title"><i class="fa fa-bug"></i>This flow has a bug!</h3>
  <p>You must fix it before you can run it.</p>
  <mdl-button mdl-button-type="raised" mdl-colored="primary" mdl-ripple (click)="dialogRef.close()">OK</mdl-button>`,
  styleUrls: ['./home.style.css']
})
export class HasBugsDialog {
  constructor(public dialogRef: MdDialogRef<HasBugsDialog>) { }
}
