import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Flow } from "../models/flow.model";
import { Step } from '../models/step.model';
import { ProjectService } from '../../../services/projects';
import { ManageFlowsService } from "../services/manage-flows.service";
import { EntitiesService } from '../../../models/entities.service';
import { Entity } from '../../../models/entity.model';

@Component({
  selector: 'app-edit-flow',
  template: `
  <app-edit-flow-ui
    [flow]="flow"
    [stepsArray]="stepsArray"
    [databases]="databases"
    [entities]="entities"
    (saveFlow)="saveFlow($event)"
    (deleteFlow)="deleteFlow($event)"
    (stepCreate)="createStep($event)"
    (stepUpdate)="updateStep($event)"
    (stepDelete)="deleteStep($event)"
  ></app-edit-flow-ui>
`
})
export class EditFlowComponent implements OnInit {
  flowId: string;
  flows: any;
  flow: Flow;
  stepsArray: any;
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
    this.getSteps();
    this.getDbInfo();
    this.getEntities();
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
  getSteps() {
    this.manageFlowsService.getSteps(this.flowId).subscribe( resp => {
      console.log('steps', resp);
      this.stepsArray = resp;
    });
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
      this.flow = Flow.fromJSON(resp);
      this.getSteps();
    });
  }
  deleteFlow(flowId): void {
    this.manageFlowsService.deleteFlow(flowId).subscribe(resp => {
      console.log('delete response', resp);
    });
  }
  createStep(step) {
    this.manageFlowsService.createStep(this.flow.id, step).subscribe(resp => {
      console.log('create response', resp);
      this.getSteps();
    });
  }
  updateStep(step) {
    this.manageFlowsService.updateStep(this.flow.id, step.id, step).subscribe(resp => {
      console.log('update response', resp);
      this.getSteps();
    });
  }
  deleteStep(stepId) {
    this.manageFlowsService.deleteStep(this.flow.id, stepId).subscribe(resp => {
      this.flow = Flow.fromJSON(resp);
      this.getSteps();
    });
  }
}
