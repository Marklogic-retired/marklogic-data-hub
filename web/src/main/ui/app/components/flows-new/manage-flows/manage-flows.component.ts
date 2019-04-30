import {Component, ViewChild, OnInit, OnDestroy} from "@angular/core";
import {Flow} from "../models/flow.model";
import { timer } from 'rxjs';
import {ManageFlowsService} from "../services/manage-flows.service";
import { RunningJobService } from '../../jobs-new/services/running-job-service';
import {ManageFlowsUiComponent} from "./ui/manage-flows-ui.component";
import {DeployService} from '../../../services/deploy/deploy.service';
import * as _ from "lodash";

@Component({
  selector: 'flows-page',
  template: `
    <flows-page-ui
      [flows]="this.flows"
      (createFlow)="this.createFlow($event)"
      (deleteFlow)="this.deleteFlow($event)"
      (saveFlow)="this.saveFlow($event)"
      (runFlow)="this.runFlow($event)"
      (stopFlow)="this.stopFlow($event)"
      (redeployModules)="this.redeployModules()"
    >
    </flows-page-ui>
  `
})
export class ManageFlowsComponent implements OnInit, OnDestroy {

  @ViewChild(ManageFlowsUiComponent)
  flowsPageUi: ManageFlowsUiComponent;
  flows = [];

  constructor(
    private manageFlowsService: ManageFlowsService,
    private runningJobService: RunningJobService,
    private deployService: DeployService
  ) {
  }

  ngOnInit() {
    this.getFlows();
  }
  ngOnDestroy(): void {
    this.runningJobService.stopPolling();
  }

  createFlow(newFlow) {
    // create flow first
    this.manageFlowsService.createFlow(newFlow).subscribe(resp => {
      // refresh flows
      this.getFlows();
    });
  }

  deleteFlow(flowId) {
    this.manageFlowsService.deleteFlow(flowId).subscribe(resp => {
      // refresh flows
      this.getFlows();
    });
  }

  saveFlow(flow) {
    this.manageFlowsService.saveFlow(flow).subscribe(resp => {
      // refresh flows
      this.getFlows();
    });
  }

  getFlows() {
    this.manageFlowsService.getFlows().subscribe(resp => {
      _.remove(this.flows, () => {
        return true;
      });
      _.forEach(resp, flow => {
        const flowObject = Flow.fromJSON(flow);
        this.flows.push(flowObject);
        const isFlowRunning = this.runningJobService.checkJobStatus(flowObject);
        if (isFlowRunning) {
          const flowIndex = this.flows.findIndex(obj => obj.id === flowObject.id);
          this.pollFlow(flowIndex, flowObject.id);
        }
      });
      this.flowsPageUi.renderRows();
    });
  }

  runFlow(runObject): void {
    this.manageFlowsService.runFlow(runObject).subscribe(resp => {
      // TODO add response check
      const flowIndex = this.flows.findIndex(flow => flow.id === runObject.id);
      this.pollFlow(flowIndex, runObject.id);
    });
  }

  pollFlow(index: number, flowId: string) {
    this.runningJobService.pollFlowById(flowId).subscribe( poll => {
      this.flows[index] = Flow.fromJSON(poll);
      this.flowsPageUi.renderRows();
    });
  }

  stopFlow(flowId) {
    this.manageFlowsService.stopFlow(flowId).subscribe(resp => {
      console.log('stop flow response', resp);
      this.getFlows();
      this.runningJobService.stopPolling();
    });
  }

  redeployModules() {
    this.deployService.redeployUserModules().subscribe(() => {
      console.log('Modules redeployed');
    });
  }

}
