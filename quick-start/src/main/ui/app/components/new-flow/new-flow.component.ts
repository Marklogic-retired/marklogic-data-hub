import {Component, HostListener, Inject, OnDestroy} from '@angular/core';

import { MdlDialogReference } from '@angular-mdl/core';

import { EnvironmentService } from '../../services/environment';

import * as _ from 'lodash';
import {MapService} from "../mappings/map.service";
import {Mapping} from "../mappings/mapping.model";
import {Entity} from "../../models";
import {Flow} from '../../models/flow.model';

@Component({
  selector: 'app-new-flow',
  template: `
    <app-new-flow-ui 
      [markLogicVersion]="markLogicVersion"
      [flowType]="flowType"
      [scaffoldOptions]="scaffoldOptions"
      [mappingOptions]="mappingOptions"
      [codeFormats]="codeFormats"
      [dataFormats]="dataFormats"
      [startingScaffoldOption]="startingScaffoldOption"
      [startingMappingOption]="startingMappingOption"
      [flow]="flow"
      [flows]="flows"
      [entity]="entity"
      (flowChanged)="flowChanged($event)"
      (createClicked)="create()"
    ></app-new-flow-ui>
  `
})
export class NewFlowComponent implements OnDestroy {
  flowType: string;
  markLogicVersion: number;
  actions: any;
  entity: Entity;
  flows: Array<Flow>;
  errorMsg: string;
  isNameValid: boolean = true;

  scaffoldOptions = [
    { label: 'Create Structure from Entity Definition', value: true },
    { label: 'Blank Template', value: false }
  ];
  mappingOptions = [
    { label: 'None', value: null}
  ];
  codeFormats = [
    { label: 'Javascript', value: 'JAVASCRIPT' },
    { label: 'XQuery', value: 'XQUERY' }
  ];
  dataFormats = [
    { label: 'JSON', value: 'JSON' },
    { label: 'XML', value: 'XML' }
  ];

  startingScaffoldOption: any = null;

  startingMappingOption: any = null;

  emptyFlow = {
    flowName: <string>null,
    codeFormat: 'JAVASCRIPT',
    dataFormat: 'JSON',
    useEsModel: true,
    mappingName: <string>null
  };

  flow = _.clone(this.emptyFlow);

  dataFormat: any;

  mapSub: any;

  constructor(
    private envService: EnvironmentService,
    private mapService: MapService,
    @Inject('flowType') flowType: string,
    @Inject('actions') actions: any,
    @Inject('entity') entity: Entity,
    @Inject('flows') flows: Array<Flow>
  ) {
    this.flowType = _.capitalize(flowType);
    this.flow = _.clone(this.emptyFlow);
    this.actions = actions;
    this.entity = entity;
    this.flows = flows;
    this.startingMappingOption = this.mappingOptions[0];
    this.mapService.getMappings();
    this.markLogicVersion = this.getMarkLogicVersion();
    if (this.getMarkLogicVersion() === 8) {
      this.flow.useEsModel = false;
    } else {
      this.startingScaffoldOption = (flowType === 'INPUT') ?
        this.scaffoldOptions[1] :
        this.scaffoldOptions[0];
    }
  }

  ngOnInit() {
    this.mapSub = this.mapService.mappingsChange.subscribe( () => {
        this.mappingOptions = [];
        this.mappingOptions.push({label: 'None', value: null});
        this.mapService.getMappingsByEntity(this.entity).forEach((map) => {
          this.mappingOptions.push({label: map.name, value: map.name});
        });
        this.startingMappingOption = this.mappingOptions[0];
    });
  }

  ngOnDestroy() {
    this.mapSub.unsubscribe();
  }

  flowChanged(flow: any) {
    this.flow = flow;
  }

  create() {
    if (this.flow.flowName && this.flow.flowName.length > 0) {
      if (this.actions && this.actions.save) {
        this.actions.save(this.flow);
      }
    }
  }

  getMarkLogicVersion(): number {
    let version = this.envService.marklogicVersion.substr(0, this.envService.marklogicVersion.indexOf('.'));
    return parseInt(version);
  }

}
