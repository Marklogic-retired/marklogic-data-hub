import {Component, ViewChild, OnInit} from "@angular/core";
import {Flow} from "../models/flow.model";
import {ManageFlowsService} from "../services/manage-flows.service";
import {ManageFlowsUiComponent} from "./ui/manage-flows-ui.component";
import * as _ from "lodash";

@Component({
  selector: 'flows-page',
  template: `
    <flows-page-ui
      [flows]="this.flows"
      (createFlow)="this.createFlow($event)"
      (deleteFlow)="this.deleteFlow($event)"
      (saveFlow)="this.saveFlow($event)"
      (redeployAll)="this.redeployAll()"
    >
    </flows-page-ui>
  `
})
export class ManageFlowsComponent implements OnInit {

  @ViewChild(ManageFlowsUiComponent)
  flowsPageUi: ManageFlowsUiComponent;

  flows = [];

  constructor(
    private manageFlowsService: ManageFlowsService
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

  redeployAll() {
    console.log(`Redeploy All Flows`)
  }
}
