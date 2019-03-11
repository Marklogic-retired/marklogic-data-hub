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
        this.getSteps();
      });
    }
  }
  getSteps() {
    this.manageFlowsService.getSteps(this.flowId).subscribe( resp => {
      console.log('steps', resp);
      const newArray = [];
      this.flow.steps.map(step => {
        newArray.push(resp.find(item => item.id === step.id));
      });
      this.stepsArray = newArray;
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
      this.stepsArray.push(resp);
    });
  }
  updateStep(step) {
    this.manageFlowsService.updateStep(this.flow.id, step.id, step).subscribe(resp => {
      this.stepsArray.forEach( step => {
        if (step.id === resp.id) {
          step = resp;
        }
      });
    });
  }
  deleteStep(stepId) {
    this.manageFlowsService.deleteStep(this.flow.id, stepId).subscribe(resp => {
      this.flow = Flow.fromJSON(resp);
      this.getSteps();
    });
  }
}
