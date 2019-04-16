import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';
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
    [collections]="collections"
    [entities]="entities"
    [selectedStepId]="selectedStepId"
    (saveFlow)="saveFlow($event)"
    (stopFlow)="stopFlow($event)"
    (runFlow)="runFlow($event)"
    (deleteFlow)="deleteFlow($event)"
    (stepCreate)="createStep($event)"
    (stepSelected)="stepSelected($event)"
    (stepUpdate)="updateStep($event)"
    (stepDelete)="deleteStep($event)"
  ></app-edit-flow-ui>
`
})
export class EditFlowComponent implements OnInit {
  flowId: string;
  flow: Flow;
  stepsArray: any;
  selectedStepId: string;
  databases: any = {
    final: '',
    staging: '',
    job: '',
    modules: ''
  };
  collections: string[] = [];
  entities: Array<Entity> = new Array<Entity>();
  running: any;
  constructor(
   private manageFlowsService: ManageFlowsService,
   private projectService: ProjectService,
   private entitiesService: EntitiesService,
   private activatedRoute: ActivatedRoute,
   private router: Router
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
      this.selectedStepId = (this.stepsArray.length > 0) ? this.stepsArray[0].id : null;
    });
  }
  getDbInfo() {
    this.projectService.getProjectEnvironment().subscribe( resp => {
      this.databases.final = resp.mlSettings.finalDbName;
      this.databases.job = resp.mlSettings.jobDbName;
      this.databases.staging = resp.mlSettings.stagingDbName;
      this.databases.modules = resp.mlSettings.modulesDbName;
      this.getCollections(this.databases.final);
    });
  }
  getCollections(db) {
    this.manageFlowsService.getCollections(db).subscribe( resp => {
      this.collections = resp;
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
      // TODO update delete response check
      if (resp) {
        this.router.navigate(['flows']);
      }
    });
  }
  runFlow(runObject): void {
    this.manageFlowsService.runFlow(runObject).subscribe(resp => {
      // TODO add response check
      // this.running = timer(0, 750)
      //   .subscribe(() =>  this.manageFlowsService.getFlowById(this.flowId).subscribe( poll => {
      //     this.flow = Flow.fromJSON(poll);
      //     if (this.flow.latestJob.status !== 'running') {
      //       this.running.unsubscribe();
      //     }
      //   })
      // );
    });
  }
  stopFlow(flowid): void {
    this.manageFlowsService.stopFlow(flowid).subscribe(resp => {
      this.flow = Flow.fromJSON(resp);
      this.getSteps();
      this.running.unsubscribe();
    });
  }
  createStep(stepObject) {
    this.manageFlowsService.createStep(this.flow.id, stepObject.index, stepObject.step).subscribe(resp => {
      this.stepsArray.splice(stepObject.index, 0, resp);
      console.log('stepsArray', this.stepsArray);
      this.manageFlowsService.getFlowById(this.flowId).subscribe( resp => {
        this.flow = Flow.fromJSON(resp);
      });
    });
  }
  stepSelected(index) {
    this.selectedStepId = this.stepsArray[index].id;
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
      console.log('delete response', resp);
      // TODO update based off of response
      this.getFlow();
    });
  }
}
