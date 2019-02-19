import {MdlDialogService, MdlSnackbarService} from '@angular-mdl/core';
import {Component, EventEmitter, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {distanceInWords} from 'date-fns';
import * as _ from 'lodash';
import {timer as observableTimer, Observable} from 'rxjs';
import {DeployService} from '../../services/deploy/deploy.service';
import {EntitiesService} from '../../models/entities.service';
import {Entity, Plugin} from '../../models';
import {Flow} from '../../models/flow.model';
import {EnvironmentService} from '../../services/environment';
import {HarmonizeFlowOptionsComponent} from '../harmonize-flow-options';
import {JobListenerService} from '../jobs';
import {NewFlowComponent} from '../new-flow/new-flow.component';
import {HasBugsDialogComponent} from '..';
import {CodemirrorComponent} from '../codemirror';
import {NewEntityComponent} from '../new-entity/new-entity.component';

@Component({
  selector: 'app-flows',
  template: `
    <app-flows-ui
      [hasErrors]="hasErrorsInput"
      [markLogicVersion]="markLogicVersionInput"
      [lastDeployed]="lastDeployedInput"
      [entities]="entities"
      [entity]="entity"
      [errors]="errorsInput"
      [flowType]="flowType"
      [flow]="flow"
      [mlcpOptions]="mlcpOptions"
      (deleteFlowClicked)="deleteFlow($event)"
      (showNewFlowClicked)="showNewFlow($event)"
      (redeployClicked)="redeployModules()"
      (runImportClicked)="runInputFlow($event)"
      (runHarmonizeClicked)="runHarmonizeFlow($event)"
      (savePluginClicked)="savePlugin($event)"
    >
    </app-flows-ui>
  `
})
export class FlowsComponent implements OnInit, OnDestroy {
  @ViewChildren(CodemirrorComponent) codemirrors: QueryList<CodemirrorComponent>;
  @ViewChild(HarmonizeFlowOptionsComponent) harmonizeFlowOptions: HarmonizeFlowOptionsComponent;

  flowTypes: Array<string> = ['Input', 'Harmonize'];
  entities: Array<Entity>;
  entity: Entity;
  flow: Flow;
  flowType: string;
  view: string;
  isSaving = false;
  mlcpOptions: any;
  entitiesReady: EventEmitter<boolean> = new EventEmitter();
  hasErrorsInput = false;
  markLogicVersionInput: string;
  lastDeployedInput: string;
  errorsInput: any;


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
    private envService: EnvironmentService,
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
        const entity = _.find(this.entities, (e: Entity) => {
          return e.name === params.entityName;
        });

        if (!entity) {
          return;
        }

        const flow = _.find(params.flowType === 'HARMONIZE' ? entity.harmonizeFlows : entity.inputFlows, (f: Flow) => {
          return f.flowName === params.flowName;
        });

        if (!flow) {
          return;
        }

        this._setFlow(entity, flow, params.flowType);
      }
    });
  }

  ngOnInit() {
    if (this.entities && !this.paramListener) {
      this.registerParamListener();
    }

    this.markLogicVersionInput = this.getMarkLogicVersion();
    observableTimer(300).subscribe(() => {
      this.lastDeployedInput = this.getLastDeployed();
    });
  }

  ngDoCheck() {
    this.hasErrorsInput = this.hasErrors();
    this.errorsInput = this.getErrors();
  }

  ngOnDestroy() {
    this.paramListener.unsubscribe();
  }

  private jobFinished = (jobId) => {
    setTimeout(() => {
      this.snackbar.showSnackbar({
        message: `Job ${jobId} Finished.`,
        action: {
          handler: () => {
          },
          text: 'OK'
        }
      });
    }, 0);
  }


  getLastDeployed() {
    const lastDeployed = this.deployService.getLastDeployed();
    if (lastDeployed) {
      return distanceInWords(lastDeployed, new Date()) + ' ago';
    }
    return 'Not Yet Deployed';
  }

  getErrors() {
    return this.deployService.errors;
  }

  hasErrors(): boolean {
    const errors = this.getErrors();
    return !!(errors && _.keys(errors).length > 0);
  }

  entityHasError(entityName: string): boolean {
    const errors = this.getErrors();
    return !!(errors && errors[entityName]);
  }

  flowHasError(entityName: string, flowName: string): boolean {
    const errors = this.getErrors();
    return !!(errors && errors[entityName] && errors[entityName][flowName]);
  }

  pluginHasError(flow: Flow, pluginType: string) {
    const errors = this.getErrors();
    return !!(
      errors &&
      errors[flow.entityName] &&
      errors[flow.entityName][flow.flowName] &&
      errors[flow.entityName][flow.flowName][pluginType]
    );
  }

  getPluginErrors(flow: Flow, pluginType: string): any {
    const errors = this.getErrors();
    if (errors &&
      errors[flow.entityName] &&
      errors[flow.entityName][flow.flowName] &&
      errors[flow.entityName][flow.flowName][pluginType]) {
      return errors[flow.entityName][flow.flowName][pluginType];
    }
    return null;
  }

  getErrorMessage(flow: Flow, pluginType: string) {
    const errors = this.getErrors();
    const o = errors[flow.entityName][flow.flowName][pluginType];
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
    _.each(this.entities, e => {
      this.setCollapsed(e, true);
    });
    this.setCollapsed(entity, !collapsed);
  }

  deleteFlow({flow, flowType}: { flow: Flow, flowType: string }): void {
    var resetView = (this.flow === undefined) || (
      flow.flowName === this.flow.flowName &&
      flowType === this.getFlowType(this.flow, this.flow.entityName)
    );
    this.dialogService.confirm(`Really delete ${flow.flowName}`, 'Cancel', 'Delete').subscribe(() => {
        this.entitiesService.deleteFlow(flow, flowType).subscribe(() => {
          if (flowType.toUpperCase() === 'HARMONIZE') {
            this.deleteHarmonizeSettings(flow.flowName);
          }
          if (resetView) {
            this.router.navigate(['/flows']);
          }
        });
      },
      () => {
      });
  }

  setFlow(flow: Flow, flowType: string): void {
    this.router.navigate(['/flows', flow.entityName, flow.flowName, flowType]);
  }

  _setFlow(entity: Entity, flow: Flow, flowType: string) {
    this.view = 'flow';
    this.entity = entity;
    flow.plugins.forEach((plugin: Plugin) => {
      const mode = plugin.pluginPath.endsWith('js') ? 'text/javascript' : 'application/xquery';
      plugin.codemirrorConfig = this.baseCodemirrorConfig(mode);
    });
    this.flow = flow;
    this.flow.tabIndex = 0;
    this.flowType = flowType;
    this.runFlow(flow, flowType);
  }

  syncPluginText(plugin: Plugin, fileContents: string): void {
    if (plugin.fileContents !== fileContents) {
      plugin.fileContents = fileContents;
    }
  }

  savePlugin({plugin}: { plugin: Plugin }): void {
    if (plugin.$dirty) {
      this.isSaving = true;
      this.entitiesService
        .savePlugin(this.entity, this.flowType, this.flow, plugin)
        .subscribe(() => {
          if (plugin) {
            this.isSaving = false;
            plugin.$dirty = false;

            const filename = plugin.pluginPath.replace(/^.+[\/\\]([^/\\]+)$/, '$1');
            this.snackbar.showSnackbar({
              message: `${filename} saved.`,
            });
          }
        });
    }
  }

  isActiveFlow(flow: Flow, flowType: string): boolean {
    return this.flow &&
      this.flow.entityName === flow.entityName &&
      this.flow.flowName === flow.flowName &&
      this.flowType.toUpperCase() === flowType.toUpperCase();
  }

  isActiveEntity(entity: Entity): boolean {
    return this.entity === entity;
  }

  showNewEntity(ev: Event): void {
    const actions = {
      save: (newEntity: Entity) => {
        this.entitiesService.createEntity(newEntity).subscribe((entity: Entity) => {
          this.entities.splice(_.sortedIndexBy(this.entities, entity, 'name'), 0, entity);
          this.toggleEntity(entity);
        });
      }
    };
    this.dialogService.showCustomDialog({
      component: NewEntityComponent,
      providers: [
        {provide: 'actions', useValue: actions}
      ],
      isModal: true
    });
  }

  showNewFlow({entity, flowType}: { entity: Entity, flowType: string }): void {
    const actions = {
      save: (newFlow: Flow) => {
        this.entitiesService.createFlow(entity, flowType.toUpperCase(), newFlow).subscribe((flow: Flow) => {
          if (flowType.toUpperCase() === 'INPUT') {
            entity.inputFlows.push(flow);
          } else if (flowType.toUpperCase() === 'HARMONIZE') {
            entity.harmonizeFlows.push(flow);
          }
          this.setFlow(flow, flowType.toUpperCase());
        });
      }
    };
    this.dialogService.showCustomDialog({
      component: NewFlowComponent,
      providers: [
        {provide: 'flowType', useValue: flowType},
        {provide: 'actions', useValue: actions},
        {provide: 'entity', useValue: entity},
        {provide: 'flows', useValue: this.getFlows(entity, flowType)}
      ],
      isModal: true
    });
  }

  getFlows(entity: Entity, flowType: string) {
    return (flowType.toUpperCase() === 'INPUT') ? entity.inputFlows : entity.harmonizeFlows;
  }

  getFlowType(flow: Flow, entityName: string) {
    var flowType = null;
    var entity = this.entities.find(function (entity) {
      return (entity.name === entityName)
    });
    if (this.entity.inputFlows.indexOf(flow) > -1) {
      flowType = 'INPUT';
    } else if (this.entity.harmonizeFlows.indexOf(flow) > -1) {
      flowType = 'HARMONIZE';
    }
    return flowType;
  }

  runFlow(flow: Flow, flowType: string) {
    if (this.flowHasError(flow.entityName, flow.flowName)) {
      this.showFlowErrorDialog(flow);
    }
    const lower = flowType.toLowerCase();
    if (lower === 'input') {
      this.entitiesService.getInputFlowOptions(flow).subscribe(mlcpOptions => {
        this.mlcpOptions = mlcpOptions;
      });
    }
  }

  showFlowErrorDialog(flow: Flow): void {
    this.dialogService.showCustomDialog({
      component: HasBugsDialogComponent,
      providers: [
        {provide: 'errors', useValue: this.getErrors()[flow.entityName][flow.flowName]}
      ],
      isModal: true
    });
  }

  runInputFlow({flow, options}: { flow: Flow, options: any }): void {
    this.entitiesService.runInputFlow(flow, options);
    this.snackbar.showSnackbar({
      message: flow.entityName + ': ' + flow.flowName + ' starting...',
      timeout: 10000
    });
  }

  runHarmonizeFlow({flow, options}: { flow: Flow, options: any }): void {
    this.entitiesService.runHarmonizeFlow(flow, options.batchSize, options.threadCount, options.options);
    this.snackbar.showSnackbar({
      message: flow.entityName + ': ' + flow.flowName + ' starting...',
    });
  }

  deleteHarmonizeSettings(flowName) {
    let localString = localStorage.getItem("flowSettings");
    let localObj = {};
    if (localString) {
      localObj = JSON.parse(localString);
      delete localObj[flowName];
    }
    localStorage.setItem("flowSettings", JSON.stringify(localObj));
  }

  redeployModules() {
    this.deployService.redeployUserModules().subscribe(() => {
      this.isSaving = false;
      if (this.flow && this.flow.plugins) {
        _.each(this.flow.plugins, (plugin) => {
          plugin.$dirty = false;
        });
      }
    });
    this.snackbar.showSnackbar({
      message: 'Redeploying Modules...',
    });
  }

  tabChanged(event) {
    if (this.flow) {
      this.flow.tabIndex = event.index;
      const plugin: Plugin = this.flow.plugins[event.index - 1];
      if (plugin && !plugin.hasShown) {
        plugin.$dirty = false;
        plugin.hasShown = true;
      }
      if (plugin) {
        setTimeout(() => {
          const mode = plugin.pluginPath.endsWith('js') ? 'text/javascript' : 'application/xquery';
          plugin.codemirrorConfig.mode = mode;
          this.codemirrors.toArray()[event.index - 1].refresh();
        }, 250);
      }
    }
  }

  setCM(plugin, $event) {
    plugin.cm = $event;
  }

  getMarkLogicVersion(): string {
    return this.envService.marklogicVersion;
  }
}
