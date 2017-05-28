import { Component, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Entity } from '../entities/entity.model';
import { Flow } from '../entities/flow.model';
import { Plugin } from '../entities/plugin.model';

import { EntitiesService } from '../entities/entities.service';

import { MdlSnackbarService } from '@angular-mdl/core';

import { MdlDialogService, MdlDialogReference } from '@angular-mdl/core';

import { MlcpUiComponent } from '../mlcp-ui';
import { HarmonizeFlowOptionsComponent } from '../harmonize-flow-options/harmonize-flow-options.component';
import { NewFlowComponent } from '../new-flow/new-flow.component';

import { JobListenerService } from '../jobs/job-listener.service';

import { HasBugsDialogComponent } from '../has-bugs-dialog';

import { DeployService } from '../deploy/deploy.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-flows',
  templateUrl: './flows.component.html',
  styleUrls: ['./flows.component.scss'],
})
export class FlowsComponent implements OnInit, OnDestroy {
  @ViewChild(MlcpUiComponent) mlcp: MlcpUiComponent;
  @ViewChild(HarmonizeFlowOptionsComponent) harmonize: HarmonizeFlowOptionsComponent;

  flowTypes: Array<string> = ['Input', 'Harmonize'];
  entities: Array<Entity>;
  entity: Entity;
  flow: Flow;
  flowPlugin: Plugin;
  flowType: string;
  view: string;
  isSaving = false;
  entitiesReady: EventEmitter<boolean> = new EventEmitter();

  private paramListener: any;

  codeMirrorConfig = {
    lineNumbers: true,
    indentWithTabs: false,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    readOnly: false,
    gutters: ['CodeMirror-linenumbers', 'buglines'],
    mode: 'application/xquery'
  };

  constructor(
    private entitiesService: EntitiesService,
    private deployService: DeployService,
    private snackbar: MdlSnackbarService,
    private dialogService: MdlDialogService,
    private jobListener: JobListenerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.entitiesService.entitiesChange.subscribe(entities => {
      this.entities = entities;
      if (!this.paramListener) {
        this.registerParamListener();
      }
    });

    deployService.onDeploy.subscribe(() => {
      this.getEntities();
    });
    this.getEntities();
    this.deployService.validateUserModules();
    this.jobListener.jobFinished.subscribe(this.jobFinished);
  }

  registerParamListener() {
    this.paramListener = this.route.params.subscribe(params => {
      if (params.entityName && params.flowName && params.flowType) {
        let entity = _.find(this.entities, (e: Entity) => {
          return e.name === params.entityName;
        });

        if (!entity) {
          return;
        }

        let flow = _.find(params.flowType === 'HARMONIZE' ? entity.harmonizeFlows : entity.inputFlows, (f: Flow) => {
          return f.flowName == params.flowName;
        });

        if (!flow) {
          return;
        }

        if (params.action === 'edit') {
          if (!params.plugin) {
            return;
          }

          let plugin = _.find(flow.plugins, (p: Plugin) => {
            return p.pluginType === params.plugin;
          });

          if (!plugin) {
            return;
          }

          this.setFlowPlugin(entity, flow, params.flowType, plugin);
        }
        else {
          this._setFlow(entity, flow, params.flowType);
        }
      }
    });
  }

  ngOnInit() {
    if (this.entities && !this.paramListener) {
      this.registerParamListener();
    }
  }

  ngOnDestroy() {
    this.paramListener.unsubscribe();
  }

  private jobFinished = (jobId) => {
    setTimeout(() => {
      this.snackbar.showSnackbar({
        message: `Job ${jobId} Finished.`,
      });
    }, 0);
  };

  getLastDeployed() {
    const lastDeployed = this.deployService.getLastDeployed();
    if (lastDeployed) {
      return lastDeployed.fromNow();
    }
    return 'Not Yet Deployed';
  }

  getErrors() {
    return this.deployService.errors;
  }

  hasErrors(): boolean {
    let errors = this.getErrors();
    return !!(errors && _.keys(errors).length > 0);
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

  getPluginErrors(flow: Flow, pluginType: string): any {
    let errors = this.getErrors();
    if (errors &&
      errors[flow.entityName] &&
      errors[flow.entityName][flow.flowName] &&
      errors[flow.entityName][flow.flowName][pluginType]) {
      return errors[flow.entityName][flow.flowName][pluginType];
    }
    return null;
  }

  getErrorMessage(flow: Flow, pluginType: string) {
    let errors = this.getErrors();
    let o = errors[flow.entityName][flow.flowName][pluginType];
    return `ERROR:\n${o.msg}\n\nat\n\n${o.uri}:${o.line}:${o.column}`;
  }

  isCollapsed(entity: Entity): boolean {
    let collapsed: string = localStorage.getItem(entity.name + '-collapsed');
    if (collapsed === null) {
      collapsed = 'true';
    }
    return collapsed === 'true';
  }

  setCollapsed(entity: Entity, collapsed: boolean): void {
    localStorage.setItem(entity.name + '-collapsed', collapsed.toString());
  }

  getEntities(): void {
    this.entitiesService.getEntities();
  }

  toggleEntity(entity: Entity): void {
    const collapsed: boolean = this.isCollapsed(entity);
    _.each(this.entities, e => { this.setCollapsed(e, true); });
    this.setCollapsed(entity, !collapsed);
  }

  deleteFlow(event: MouseEvent, flow: Flow, flowType: string): void {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.cancelBubble = true;
    this.dialogService.confirm(`Really delete ${flow.flowName}`, 'Cancel', 'Delete').subscribe(() => {
      this.entitiesService.deleteFlow(flow, flowType).subscribe(() => {
        this.router.navigate(['/flows']);
      });
    },
    () => {});
  }

  setFlow(flow: Flow, flowType: string): void {
    this.router.navigate(['/flows/run', flow.entityName, flow.flowName, flowType])
  }

  _setFlow(entity: Entity, flow: Flow, flowType: string) {
    if (this.mlcp && this.mlcp.isVisible()) {
      this.mlcp.cancel();
    } else if (this.harmonize && this.harmonize.isVisible()) {
      this.harmonize.cancel();
    }
    this.view = 'flow';
    this.entity = entity;
    this.flow = flow;
    this.flowType = flowType;
    this.flowPlugin = null;
    this.runFlow(flow, flowType);
  }

  editPlugin(entity: Entity, flow: Flow, flowType: string, flowPlugin: Plugin) {
    this.router.navigate(['/flows/edit', flow.entityName, flow.flowName, flowType, flowPlugin.pluginType]);
  }

  setFlowPlugin(entity: Entity, flow: Flow, flowType: string, flowPlugin: Plugin): void {
    this.view = 'flowPlugin';
    this.entity = entity;
    this.flow = flow;
    this.flowType = flowType;
    this.flowPlugin = flowPlugin;
    this.codeMirrorConfig.mode = (_.endsWith(Object.keys(flowPlugin.files)[0], 'js'))? 'text/javascript' : 'application/xquery';
  }

  syncPluginText(fileName: string, fileContents: string): void {
    if (this.flowPlugin) {
      if (this.flowPlugin.files[fileName] !== fileContents) {
        this.flowPlugin.files[fileName] = fileContents;
        this.flowPlugin.$dirty = true;
      }
    }
  }

  savePlugin(): void {
    if (this.flowPlugin.$dirty) {
      this.isSaving = true;
      this.entitiesService
        .savePlugin(this.entity, this.flowType, this.flow, this.flowPlugin)
        .subscribe(() => {
          if (this.flowPlugin) {
            this.isSaving = false;
            this.flowPlugin.$dirty = false;
            let filename = _.keys(this.flowPlugin.files)[0];
            this.snackbar.showSnackbar({
              message: `${filename} saved.`,
            });
          }
        });
    }
  }

  isActiveFlow(flow: Flow): boolean {
    return this.flow === flow;
  }

  isActiveEntity(entity: Entity): boolean {
    return this.entity === entity;
  }

  isActivePlugin(flow: Flow, plugin: Plugin): boolean {
    return this.flow && this.flow.flowName === flow.flowName &&
      this.flowPlugin &&
      this.flowPlugin.pluginType === plugin.pluginType;
  }

  showNewFlow(entity: Entity, flowType: string): void {
    let actions = {
      save: (newFlow: Flow) => {
        this.entitiesService.createFlow(entity, flowType.toUpperCase(), newFlow).subscribe((flow: Flow) => {
          if (flowType === 'Input') {
            entity.inputFlows.push(flow);
          } else if (flowType === 'Harmonize') {
            entity.harmonizeFlows.push(flow);
          }
        });
      }
    };
    this.dialogService.showCustomDialog({
      component: NewFlowComponent,
      providers: [
        { provide: 'flowType', useValue: flowType },
        { provide: 'actions', useValue: actions }
      ],
      isModal: true
    });
  }

  getFlows(entity: Entity, flowType: string) {
    if (flowType === 'Input') {
      return entity.inputFlows;
    }
    return entity.harmonizeFlows;
  }

  runFlow(flow: Flow, flowType: string) {
    if (this.flowHasError(flow.entityName, flow.flowName)) {
      this.dialogService.showCustomDialog({
        component: HasBugsDialogComponent,
        providers: [
          { provide: 'errors', useValue: this.getErrors()[flow.entityName][flow.flowName] }
        ],
        isModal: true
      });
    } else {
      const lower = flowType.toLowerCase();
      if (lower === 'input') {
        this.runInputFlow(flow);
      } else if (lower === 'harmonize') {
        this.runHarmonizeFlow(flow);
      }
    }
  }

  runInputFlow(flow: Flow): void {
    this.entitiesService.getInputFlowOptions(flow).subscribe(mlcpOptions => {
      this.mlcp.show(mlcpOptions, flow).subscribe((options: any) => {
        this.entitiesService.runInputFlow(flow, options);
        this.snackbar.showSnackbar({
          message: flow.entityName + ': ' + flow.flowName + ' starting...',
        });
      },
      () => {
        this.router.navigate(['/flows']);
      });
    });
  }

  runHarmonizeFlow(flow: Flow): void {
    this.harmonize.show(flow).subscribe((options: any) => {
      this.entitiesService.runHarmonizeFlow(flow, options.batchSize, options.threadCount);
      this.snackbar.showSnackbar({
        message: flow.entityName + ': ' + flow.flowName + ' starting...',
      });
    },
    () => {
      this.router.navigate(['/flows']);
    });
  }

  redeployModules() {
    this.deployService.redeployUserModules().subscribe(() => {
      if (this.flowPlugin) {
        this.isSaving = false;
        this.flowPlugin.$dirty = false;
      }
    });
    this.snackbar.showSnackbar({
      message: 'Redeploying Modules...',
    });
  }
}
