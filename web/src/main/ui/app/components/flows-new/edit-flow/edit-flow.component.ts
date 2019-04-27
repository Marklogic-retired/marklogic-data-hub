import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {timer} from 'rxjs';
import {Flow} from "../models/flow.model";
import {StepType} from '../models/step.model';
import {ProjectService} from '../../../services/projects';
import {ManageFlowsService} from "../services/manage-flows.service";
import {EntitiesService} from '../../../models/entities.service';
import {Entity} from '../../../models';
import * as _ from "lodash";

@Component({
  selector: 'app-edit-flow',
  template: `
  <app-edit-flow-ui
    [flow]="flow"
    [flowNames]="flowNames"
    [stepsArray]="stepsArray"
    [databases]="databases"
    [entities]="entities"
    [selectedStepId]="selectedStepId"
    [projectDirectory]="projectDirectory"
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
  flowNames: string[];
  stepsArray: any;
  selectedStepId: string;
  databases: any = {
    final: '',
    staging: '',
    modules: ''
  };
  collections: string[] = [];
  entities: Array<Entity> = new Array<Entity>();
  running: any;
  projectDirectory: string;
  stepType: typeof StepType = StepType;
  constructor(
   private manageFlowsService: ManageFlowsService,
   private projectService: ProjectService,
   private entitiesService: EntitiesService,
   private activatedRoute: ActivatedRoute,
   private router: Router
  ) { }

  ngOnInit() {
    this.getFlow();
    this.getAllFlowNames();
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
  getAllFlowNames() {
    this.manageFlowsService.getFlows().subscribe((flows: Flow[]) => {
      this.flowNames = _.map(flows, flow => flow.name);
    })
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
      this.databases.staging = resp.mlSettings.stagingDbName;
      this.databases.modules = resp.mlSettings.modulesDbName;
      this.projectDirectory = resp.mlSettings.ProjectDir;
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
      // TODO optimize run polling DHFPROD-2241
      console.log('run flow resp', resp);
      this.running = timer(0, 1000)
        .subscribe(() =>  this.manageFlowsService.getFlowById(this.flowId).subscribe( poll => {
          console.log('flow poll', poll);
          this.flow = Flow.fromJSON(poll);
          if (this.flow.latestJob && this.flow.latestJob.status) {
            let runStatus = this.flow.latestJob.status.replace('_', ' ');
            runStatus = runStatus.replace('-', ' ');
            runStatus = runStatus.split(' ');
            // console.log('run status', runStatus);
            if (runStatus[0] === 'finished' || runStatus[0] === 'canceled' || runStatus[0] === 'failed') {
              this.running.unsubscribe();
            }
          }
        })
      );
    });
  }
  stopFlow(flowid): void {
    this.manageFlowsService.stopFlow(flowid).subscribe(resp => {
      console.log('stop flow response', resp);
      this.flow = Flow.fromJSON(resp);
      this.getSteps();
      this.running.unsubscribe();
    });
  }
  createStep(stepObject) {
    this.setStepDefaults(stepObject.step);
    this.manageFlowsService.createStep(this.flow.id, stepObject.index, stepObject.step).subscribe(resp => {
      this.stepsArray.splice(stepObject.index, 0, resp);
      console.log('stepsArray', this.stepsArray);
      this.manageFlowsService.getFlowById(this.flowId).subscribe( resp => {
        this.flow = Flow.fromJSON(resp);
      });
      if (stepObject.step.stepDefinitionType === this.stepType.MAPPING) {
        this.createMapping(resp);
      }
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
  createMapping(step) {
    let entity = _.find(this.entities, (e: Entity) => {
          return e.name === step.options.targetEntity;
        }),
        mapName = this.flow.name + '-' + step.name,
        baseUri = (entity.info.baseUri) ? entity.info.baseUri : '',
        targetEntityType = baseUri + entity.name + '-' +
          entity.info.version + '/' + entity.name,
        mapObj = {
          language:         'zxx',
          name:             mapName,
          description:      '',
          version:          '0',
          targetEntityType: targetEntityType,
          sourceContext:    '//',
          sourceURI:        '',
          properties:       {}
        }
    console.log('create mapping', mapObj);
    this.manageFlowsService.saveMap(mapName, JSON.stringify(mapObj)).subscribe(resp => {
      this.manageFlowsService.getMap(mapName).subscribe(resp => {
        step.options['mapping'] = {
          name: resp['name'],
          version: resp['version']
        };
        this.updateStep(step);
      });
    });
  }
  setStepDefaults(step): void {
    const defaultCollections = [`${step.name}`];
    if (step.stepDefinitionType === StepType.MAPPING) {
      defaultCollections.push('mdm-content');
    }
    if (step.options && step.options.targetEntity) {
      defaultCollections.push(step.options.targetEntity);
    }
    step.options = Object.assign({ 'collections': defaultCollections }, step.options);
  }
}
