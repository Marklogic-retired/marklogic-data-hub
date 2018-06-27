import { Component, HostListener, Inject } from '@angular/core';

import { MdlDialogReference } from '@angular-mdl/core';

import { EnvironmentService } from '../environment';

import * as _ from 'lodash';
import {MapService} from "../map/map.service";

@Component({
  selector: 'app-new-flow',
  templateUrl: './new-flow.component.html',
  styleUrls: ['./new-flow.component.scss']
})
export class NewFlowComponent {
  flowType: string;
  actions: any;

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

  constructor(
    private dialog: MdlDialogReference,
    private envService: EnvironmentService,
    private mapService: MapService,
    @Inject('flowType') flowType: string,
    @Inject('actions') actions: any
  ) {
    this.flowType = _.capitalize(flowType);
    this.flow = _.clone(this.emptyFlow);
    this.actions = actions;
    this.mapService.getMaps().subscribe((maps: any) => {
      for(let mapName of maps) {
      this.mappingOptions.push({label : mapName, value : mapName});
    }
    });

    this.startingMappingOption = this.mappingOptions[0];
    if (this.getMarkLogicVersion() === 8) {
      this.flow.useEsModel = false;
    } else {
      if (flowType === 'INPUT') {
        this.startingScaffoldOption = this.scaffoldOptions[1];
      } else {
        this.startingScaffoldOption = this.scaffoldOptions[0];
      }
    }
  }

  hide() {
    this.dialog.hide();
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.cancel();
  }

  create() {
    if (this.flow.flowName && this.flow.flowName.length > 0) {
      this.hide();
      if (this.actions && this.actions.save) {
        this.actions.save(this.flow);
      }
    }
  }

  cancel() {
    this.hide();
  }

  getMarkLogicVersion(): number {
    let version = this.envService.marklogicVersion.substr(0, this.envService.marklogicVersion.indexOf('.'));
    return parseInt(version);
  }
}
