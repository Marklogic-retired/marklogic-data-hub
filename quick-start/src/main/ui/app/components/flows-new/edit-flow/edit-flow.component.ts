import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {ManageFlowsService} from '../services/manage-flows.service';
import {Flow} from "../models/flow.model";


@Component({
  selector: 'app-edit-flow',
  template: `
  <app-edit-flow-ui
    [flow]="flow"
  ></app-edit-flow-ui>
`
})
export class EditFlowComponent implements OnInit {
  flowId: string;
  flows: any;
  flow: any;

  constructor(
   private manageFlowsService: ManageFlowsService,
   private route: ActivatedRoute
  ) { }

  // @Input() flow: Flow;

  ngOnInit() {
    this.flows = this.manageFlowsService.flows;
    this.flowId = this.route.snapshot.paramMap.get('flowId');

    // GET Flow by ID if flows do not exist from flow service
    if (this.flows.length === 0) {
      this.manageFlowsService.getFlowById(this.flowId).subscribe( resp => {
        console.log('flow by id response', resp);
        this.flow = resp;
      });
    } else {
      this.flow = this.flows.find(flow => flow.id === this.flowId);
    }

  }

}
