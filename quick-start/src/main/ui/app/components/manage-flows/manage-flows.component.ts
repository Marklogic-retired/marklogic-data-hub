import { Component, OnInit } from '@angular/core';
import { ManageFlowsService } from './manage-flows.service';
import { Flow } from "./flow.model";

import * as _ from 'lodash';

@Component({
  template: `
  <app-manage-flows-ui
    [flows]="this.flows"
    (createFlow)="this.createFlow($event)"
    (deleteFlow)="this.deleteFlow($event)"
  ></app-manage-flows-ui>
  `
})
export class ManageFlowsComponent {

  public flows: Array<Flow> = new Array<Flow>();

  constructor(
    private manageFlowsService: ManageFlowsService
  ) {}

  ngOnInit() {
    this.manageFlowsService.getFlows().subscribe(resp => {
      resp.forEach(flow => {
        let flowParsed = new Flow().fromJSON(flow);
        this.flows.push(flowParsed);
      })
    });
  }

  createFlow(newFlow): void {
    this.manageFlowsService.createFlow(newFlow).subscribe(resp => {
      //
    });
  }

  deleteFlow(flowId): void {
    this.manageFlowsService.deleteFlow(flowId).subscribe(resp => {
      //
    });
  }

}
