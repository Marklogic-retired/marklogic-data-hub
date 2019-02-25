import { Component, ViewChild, OnInit } from '@angular/core';
import { ManageFlowsService } from '../services/manage-flows.service';
import { Flow } from "../models/flow.model";
import { FlowsPageUiComponent } from './ui/flows-page-ui.component';

@Component({
  selector: 'flows-page',
  template: `
  <flows-page-ui
    [flows]="this.flows"
  ></flows-page-ui>
  `
})
export class FlowsPageComponent {

  @ViewChild(FlowsPageUiComponent) flowsPageUi: FlowsPageUiComponent;

  public flows: Array<Flow> = new Array<Flow>();

  constructor(
    private manageFlowsService: ManageFlowsService
  ) {}

  ngOnInit() {
    this.manageFlowsService.getFlows().subscribe((resp: Array<Object>) => {
      resp.forEach(flow => {
        let flowParsed = new Flow().fromJSON(flow);
        this.flows.push(flowParsed);
      })
      console.log(this.flows);
      this.flowsPageUi.renderRows();
    });
  }

  createFlow(newFlow): void {
    this.manageFlowsService.createFlow(newFlow).subscribe(resp => {
      //
    });
  }

  deleteFlow(flowId): void {
    this.manageFlowsService.deleteFlow(flowId).subscribe(resp => {
      //
    });
  }

}
