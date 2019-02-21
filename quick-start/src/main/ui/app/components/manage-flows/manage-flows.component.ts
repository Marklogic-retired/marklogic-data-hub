import { Component, OnInit } from '@angular/core';
import { ManageFlowsService } from './manage-flows.service';
import { Flow } from "./flow.model";

import * as _ from 'lodash';

@Component({
  template: `
  <app-manage-flows-ui
    [flows]="this.flows"
  ></app-manage-flows-ui>
  `
})
export class ManageFlowsComponent {

  public flows: Array<Flow> = new Array<Flow>();

  constructor(
    private manageFlowsService: ManageFlowsService
  ) {}

  ngOnInit() {
    let obs = this.manageFlowsService.getFlows().subscribe(resp => {
      resp.forEach(flow => {
        let flowParsed = new Flow().fromJSON(flow);
        this.flows.push(flowParsed);
      })
    });
  }

}
