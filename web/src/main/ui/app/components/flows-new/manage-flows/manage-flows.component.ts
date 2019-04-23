import {Component, ViewChild, OnInit} from "@angular/core";
import {Flow} from "../models/flow.model";
import { timer } from 'rxjs';
import {ManageFlowsService} from "../services/manage-flows.service";
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
      (redeployModules)="this.redeployModules()"
    >
    </flows-page-ui>
  `
})
export class ManageFlowsComponent implements OnInit {

  @ViewChild(ManageFlowsUiComponent)
  flowsPageUi: ManageFlowsUiComponent;
  running: any;
  flows = [];

  constructor(
    private manageFlowsService: ManageFlowsService,
    private deployService: DeployService
  ) {
  }

  ngOnInit() {
    this.getFlows();
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
        this.flows.push(Flow.fromJSON(flow));
      });
      this.flowsPageUi.renderRows();
    });
  }

  runFlow(runObject): void {
    this.manageFlowsService.runFlow(runObject).subscribe(resp => {
      // TODO optimize run polling DHFPROD-2241
      this.running = timer(0, 500)
        .subscribe(() =>  this.manageFlowsService.getFlowById(runObject.id).subscribe( poll => {
          const flowIndex = this.flows.findIndex(flow => flow.id === runObject.id);
          this.flows[flowIndex] = Flow.fromJSON(poll);
          this.flowsPageUi.renderRows();
          if (this.flows[flowIndex].flow.latestJob && this.flows[flowIndex].flow.latestJob.status) {
            let runStatus = this.flows[flowIndex].flow.latestJob.status.replace('_', ' ');
            runStatus = this.flows[flowIndex].flow.latestJob.status.replace('-', ' ');
            runStatus = this.flows[flowIndex].flow.latestJob.status.split(' ');
            console.log('run status', runStatus);
            if (runStatus[0] === 'finished' || runStatus[0] === 'canceled' || runStatus[0] === 'failed') {
              this.running.unsubscribe();
            }
          }
        })
      );
    });
  }

  redeployModules() {
    this.deployService.redeployUserModules().subscribe(() => {
      console.log('Modules redeployed');
    });
  }

}
