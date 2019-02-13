import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren,} from '@angular/core';
import {Router} from '@angular/router';
import * as _ from 'lodash';

import {CodemirrorComponent} from '../../codemirror';
import {Entity} from '../../../models/entity.model';
import {Flow} from '../../../models/flow.model';
import {Plugin} from '../../../models/plugin.model';


@Component({
  selector: 'app-flows-ui',
  templateUrl: './flows-ui.component.html',
  styleUrls: [
    './flows-ui.component.scss'
  ]
})
export class FlowsUiComponent implements OnInit, OnDestroy {
  @Input() hasErrors = false;
  @Input() markLogicVersion;
  @Input() lastDeployed;
  @Input() entities;
  @Input() entity;
  @Input() errors;
  @Input() flowType;
  @Input() flow;
  @Input() mlcpOptions;

  @Output() deleteFlowClicked = new EventEmitter<{ flow: Flow, flowType: string }>();
  @Output() showNewFlowClicked = new EventEmitter<{ entity: Entity, flowType: string }>();
  @Output() redeployClicked = new EventEmitter<{}>();
  @Output() runImportClicked = new EventEmitter<{ flow: Flow, options: any }>();
  @Output() runHarmonizeClicked = new EventEmitter<{ flow: Flow, options: any }>();
  @Output() savePluginClicked = new EventEmitter<{ plugin: Plugin }>();

  @ViewChildren(CodemirrorComponent) codemirrors: QueryList<CodemirrorComponent>;

  flowTypes = ['Input', 'Harmonize'];

  constructor(
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  isActiveEntity(entity: Entity): boolean {
    // return this.entity === entity;
    return true;
  }

  isCollapsed(entity: Entity): boolean {
    let collapsed: string = localStorage.getItem(entity.name + '-collapsed');
    if (collapsed === null) {
      collapsed = 'true';
    }
    return collapsed === 'true';
  }

  entityHasError(entityName: string): boolean {
    const errors = this.errors;
    return !!(errors && errors[entityName]);
  }

  toggleEntity(entity: Entity): void {
    const collapsed: boolean = this.isCollapsed(entity);
    _.each(this.entities, e => {
      this.setCollapsed(e, true);
    });
    this.setCollapsed(entity, !collapsed);
  }

  setCollapsed(entity: Entity, collapsed: boolean): void {
    localStorage.setItem(entity.name + '-collapsed', collapsed.toString());
  }

  getFlows(entity: Entity, flowType: string) {
    if (flowType === 'Input') {
      return entity.inputFlows;
    }
    return entity.harmonizeFlows;
  }

  isActiveFlow(flow: Flow): boolean {
    return this.flow && this.flow.entityName === flow.entityName &&
      this.flow.flowName === flow.flowName;
  }

  flowHasError(entityName: string, flowName: string): boolean {
    const errors = this.errors;
    return !!(errors && errors[entityName] && errors[entityName][flowName]);
  }

  pluginHasError(flow: Flow, pluginType: string) {
    const errors = this.errors;
    return !!(
      errors &&
      errors[flow.entityName] &&
      errors[flow.entityName][flow.flowName] &&
      errors[flow.entityName][flow.flowName][pluginType]
    );
  }

  getPluginErrors(flow: Flow, pluginType: string): any {
    const errors = this.errors;
    if (errors &&
      errors[flow.entityName] &&
      errors[flow.entityName][flow.flowName] &&
      errors[flow.entityName][flow.flowName][pluginType]) {
      return errors[flow.entityName][flow.flowName][pluginType];
    }
    return null;
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

  setFlow(flow: Flow, flowType: string): void {
    this.router.navigate(['/flows', flow.entityName, flow.flowName, flowType]);
  }

  setCM(plugin, $event) {
    plugin.cm = $event;
  }

  syncPluginText(plugin: Plugin, fileContents: string): void {
    if (plugin.fileContents !== fileContents) {
      plugin.fileContents = fileContents;
    }
  }

  deleteFlow(flow: Flow, flowType: string): void {
    if (event.stopPropagation) {
      event.stopPropagation();
    }
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.cancelBubble = true;
    this.deleteFlowClicked.emit({flow, flowType});
  }

  showNewFlow(entity: Entity, flowType: string): void {
    this.showNewFlowClicked.emit({entity, flowType});
  }

  importFlow(flow: Flow, options: any): void {
    this.runImportClicked.emit({flow, options});
  }

  harmonizeFlow(flow: Flow, options: any): void {
    this.runHarmonizeClicked.emit({flow, options});
  }

  savePlugin(plugin: Plugin) {
    this.savePluginClicked.emit({plugin});
  }

}
