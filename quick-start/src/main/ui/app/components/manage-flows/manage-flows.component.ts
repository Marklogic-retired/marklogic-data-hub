import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ManageFlowsService } from './manage-flows.service';

import * as _ from 'lodash';

@Component({
  template: `
  <app-manage-flows-ui
    [flows]="this.flows"
  ></app-manage-flows-ui>
  `
})
export class ManageFlowsComponent {

  flows: Array<Object> = new Array<Object>();

  constructor(
    private manageFlowsService: ManageFlowsService
  ) {}

  ngOnInit() {
    this.flows = this.manageFlowsService.getFlows();
  }

  // TODO

}
