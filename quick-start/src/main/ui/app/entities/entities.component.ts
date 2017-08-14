import { Component, EventEmitter, OnInit, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Entity } from '../entities/entity.model';
import { Flow } from '../entities/flow.model';
import { Plugin } from '../entities/plugin.model';

import { EntitiesService } from '../entities/entities.service';

import { MdlDialogService, MdlDialogReference, MdlSnackbarService } from '@angular-mdl/core';

import { MlcpUiComponent } from '../mlcp-ui';
import { HarmonizeFlowOptionsComponent } from '../harmonize-flow-options/harmonize-flow-options.component';
import { NewEntityComponent } from '../new-entity/new-entity';
import { NewFlowComponent } from '../new-flow/new-flow.component';

import { JobListenerService } from '../jobs/job-listener.service';

import { HasBugsDialogComponent } from '../has-bugs-dialog';

import { DeployService } from '../deploy/deploy.service';

import { CodemirrorComponent } from '../codemirror';

import { Ng2DeviceService } from 'ng2-device-detector';

import * as _ from 'lodash';

@Component({
  selector: 'app-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss'],
})
export class EntitiesComponent implements OnInit, OnDestroy {
  @ViewChildren(CodemirrorComponent) codemirrors: QueryList<CodemirrorComponent>;

  flowTypes: Array<string> = ['Input', 'Harmonize'];
  entities: Array<Entity>;
  entity: Entity;
  flow: Flow;
  flowType: string;
  view: string;
  isSaving = false;
  mlcpOptions: any;
  entitiesReady: EventEmitter<boolean> = new EventEmitter();
  deviceInfo = null;

  private paramListener: any;

  baseCodemirrorConfig(mode: string) {
    return {
      lineNumbers: true,
      indentWithTabs: false,
      indentUnit: 2,
      tabSize: 2,
      lineWrapping: true,
      readOnly: false,
      gutters: ['CodeMirror-linenumbers', 'buglines'],
      mode: mode
    };
  }

  constructor(
    private entitiesService: EntitiesService,
    private deployService: DeployService,
    private snackbar: MdlSnackbarService,
    private dialogService: MdlDialogService,
    private jobListener: JobListenerService,
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: Ng2DeviceService
  ) {
    this.deviceInfo = this.deviceService.getDeviceInfo();
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
          return e.entityName === params.entityName;
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

        this._setFlow(entity, flow, params.flowType);
      }
    });
  }

  ngOnInit() {

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
      this.entities = entities.map((entity) => {
        return new Entity().fromJSON(entity);
      });

      if (!this.paramListener) {
        this.registerParamListener();
      }
    });
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
        this.router.navigate(['/entities']);
      });
    },
    () => {});
  }

  setFlow(flow: Flow, flowType: string): void {
    this.router.navigate(['/entities', flow.entityName, flow.flowName, flowType])
  }

  _setFlow(entity: Entity, flow: Flow, flowType: string) {
    this.view = 'flow';
    this.entity = entity;
    flow.plugins.forEach((plugin: Plugin) => {
      let mode = (_.endsWith(Object.keys(plugin.files)[0], 'js'))? 'text/javascript' : 'application/xquery';
      plugin.codemirrorConfig = this.baseCodemirrorConfig(mode);
    });
    this.flow = flow;
    this.flowType = flowType;
    this.runFlow(flow, flowType);
  }

  syncPluginText(plugin: Plugin, fileName: string, fileContents: string): void {
    if (plugin.files[fileName] !== fileContents) {
      plugin.files[fileName] = fileContents;
    }
  }

  savePlugin(plugin: Plugin): void {
    if (plugin.$dirty) {
      this.isSaving = true;
      this.entitiesService
        .savePlugin(this.entity, this.flowType, this.flow, plugin)
        .subscribe(() => {
          if (plugin) {
            this.isSaving = false;
            plugin.$dirty = false;

            let filename = _.keys(plugin.files)[0];
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

  showNewEntity(ev: Event): void {
    let actions = {
      save: (newEntity: Entity) => {
      this.entitiesService.createEntity(newEntity).subscribe((entity: Entity) => {
        this.entities.splice(_.sortedIndexBy(this.entities, entity, 'entityName'), 0, entity);
        this.toggleEntity(entity);
      });
      }
    };
    this.dialogService.showCustomDialog({
      component: NewEntityComponent,
      providers: [
        { provide: 'actions', useValue: actions }
      ],
      isModal: true
    });
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
        this.entitiesService.getInputFlowOptions(flow).subscribe(mlcpOptions => {
          this.mlcpOptions = mlcpOptions;
        });
      }
    }
  }

  runInputFlow(flow: Flow, options: any): void {
    this.entitiesService.runInputFlow(flow, options);
    this.snackbar.showSnackbar({
      message: flow.entityName + ': ' + flow.flowName + ' starting...',
    });
  }

  runHarmonizeFlow(flow: Flow, options: any): void {
    this.entitiesService.runHarmonizeFlow(flow, options.batchSize, options.threadCount);
    this.snackbar.showSnackbar({
      message: flow.entityName + ': ' + flow.flowName + ' starting...',
    });
  }

  redeployModules() {
    this.deployService.redeployUserModules().subscribe(() => {
      this.isSaving = false;
      _.each(this.flow.plugins, (plugin) => {
        plugin.$dirty = false;
      });
    });
    this.snackbar.showSnackbar({
      message: 'Redeploying Modules...',
    });
  }

  tabChanged(event) {
    if (this.flow) {
      this.flow.tabIndex = event.index;
      let plugin: Plugin = this.flow.plugins[event.index - 1];
      if (plugin && !plugin.hasShown) {
        plugin.$dirty = false;
        plugin.hasShown = true;
      }
      if (plugin) {
        setTimeout(() => {
          let mode = (_.endsWith(Object.keys(plugin.files)[0], 'js'))? 'text/javascript' : 'application/xquery';
          plugin.codemirrorConfig.mode = mode;
          this.codemirrors.toArray()[event.index - 1].refresh();
        }, 250);
      }
    }
  }

  setCM(plugin, $event) {
    plugin.cm = $event;
  }
}
