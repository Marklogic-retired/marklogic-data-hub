import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Flow } from "../models/flow.model";
import { ProjectService } from '../../../services/projects';
import { ManageFlowsService } from "../services/manage-flows.service";

@Component({
  selector: 'app-edit-flow',
  template: `
  <app-edit-flow-ui
    [flow]="flow"
    [databases]="databases"
  ></app-edit-flow-ui>
`
})
export class EditFlowComponent implements OnInit {
  flowId: string;
  flows: any;
  flow: Flow;
  databases: string[] = [];

  constructor(
   private manageFlowsService: ManageFlowsService,
   private projectService: ProjectService,
   private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getFlow();
    this.getDbInfo();
  }
  getFlow() {
    this.flows = this.manageFlowsService.flows;
    this.flowId = this.activatedRoute.snapshot.paramMap.get('flowId');

    // GET Flow by ID if flows do not exist from flow service
    if (this.flows.length === 0) {
      this.manageFlowsService.getFlowById(this.flowId).subscribe( resp => {
        console.log('flow by id response', resp);
        this.flow = Flow.fromJSON(resp);
      });
    } else {
      this.flow = this.flows.find(flow => flow.id === this.flowId);
    }
  }
  getDbInfo() {
    this.projectService.getStatus().subscribe((stats) => {
      this.databases.push(stats.finalDb);
      this.databases.push(stats.jobDb);
      this.databases.push(stats.stagingDb);
    });
  }
}
