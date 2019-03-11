import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Flow } from "../models/flow.model";
import { ProjectService } from '../../../services/projects';
import { ManageFlowsService } from "../services/manage-flows.service";
import { EntitiesService } from '../../../models/entities.service';
import { Entity } from '../../../models/entity.model';

@Component({
  selector: 'app-edit-flow',
  template: `
  <app-edit-flow-ui
    [flow]="flow"
    [databases]="databases"
    [entities]="entities"
    (saveFlow)="saveFlow($event)"
    (deleteFlow)="deleteFlow($event)"
  ></app-edit-flow-ui>
`
})
export class EditFlowComponent implements OnInit {
  flowId: string;
  flow: Flow;
  databases: string[] = [];
  entities: Array<Entity> = new Array<Entity>();

  constructor(
   private manageFlowsService: ManageFlowsService,
   private projectService: ProjectService,
   private entitiesService: EntitiesService,
   private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getFlow();
    this.getDbInfo();
    this.getEntities();
  }
  getFlow() {
    this.flowId = this.activatedRoute.snapshot.paramMap.get('flowId');

    // GET Flow by ID
    if (this.flowId) {
      this.manageFlowsService.getFlowById(this.flowId).subscribe( resp => {
        console.log('flow by id response', resp);
        this.flow = Flow.fromJSON(resp);
      });
    }
  }
  getDbInfo() {
    this.projectService.getStatus().subscribe((stats) => {
      this.databases.push(stats.finalDb);
      this.databases.push(stats.jobDb);
      this.databases.push(stats.stagingDb);
    });
  }
  getEntities() {
    this.entitiesService.getAllEntities().subscribe( resp => {
      this.entities = resp;
    });
  }
  saveFlow(flow): void {
    this.manageFlowsService.saveFlow(flow).subscribe(resp => {
      console.log('save response', resp);
    });
  }
  deleteFlow(flowId): void {
    this.manageFlowsService.deleteFlow(flowId).subscribe(resp => {
      console.log('delete response', resp);
    });
  }
}
