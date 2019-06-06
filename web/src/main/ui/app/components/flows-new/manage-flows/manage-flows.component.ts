import {Component, ViewChild, OnInit, OnDestroy} from "@angular/core";
import {Flow} from "../models/flow.model";
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
      [isLoading]="this.isLoading"
      [runFlowClicked]="this.runFlowClicked"
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
  isLoading = true;
  runFlowClicked: any = {};
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
    this.runningJobService.stopPollingAll();
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
          this.pollFlow(flowObject.id);
        }
      });
      this.isLoading = false;
      this.flowsPageUi.renderRows();
    });
  }

  runFlow(runObject: any): void {
    this.runFlowClicked[runObject.id] = true;
    this.manageFlowsService.runFlow(runObject).subscribe(resp => {
    // TODO add error handling for error response, set runFlowClicked[flow.id] = false;
      this.pollFlow(runObject.id);
    });
  }

  pollFlow(flowId: string) {
    this.runningJobService.pollFlowById(flowId).subscribe( poll => {
      const flowIndex = this.flows.findIndex(obj => obj.id === flowId);
      this.flows[flowIndex] = Flow.fromJSON(poll);
      this.flowsPageUi.renderRows();
      if (!this.runningJobService.checkJobStatus(this.flows[flowIndex]) && (this.flows[flowIndex] !== null)) {
        this.runFlowClicked[this.flows[flowIndex].id] = false;
      }
    });
  }

  stopFlow(flowId) {
    this.manageFlowsService.stopFlow(flowId).subscribe(resp => {
    });
  }

  redeployModules() {
    this.deployService.redeployUserModules().subscribe(() => {
      console.log('Modules redeployed');
    });
  }

}
