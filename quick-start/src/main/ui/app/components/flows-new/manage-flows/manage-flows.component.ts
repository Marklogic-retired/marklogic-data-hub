import {Component, ViewChild} from "@angular/core";
import {Flow} from "../models/flow.model";
import {ManageFlowsService} from "../services/manage-flows.service";
import {ManageFlowsUiComponent} from "./ui/manage-flows-ui.component";

@Component({
  selector: 'flows-page',
  template: `
    <flows-page-ui
      [flows]="this.flows"
      (createFlow)="this.createFlow($event)"
      (deleteFlow)="this.deleteFlow($event)"
      (saveFlow)="this.saveFlow($event)"
    >
    </flows-page-ui>
  `
})
export class ManageFlowsComponent {

  @ViewChild(ManageFlowsUiComponent)
  flowsPageUi: ManageFlowsUiComponent;

  flows = [];

  constructor(private manageFlowsService: ManageFlowsService){
  }

  ngOnInit() {
    this.manageFlowsService.getFlows().subscribe(resp => {
      resp.forEach(flow => {
        let flowParsed = Flow.fromJSON(flow);
        this.flows.push(flowParsed);
      });
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

  saveFlow(flow): void {
    this.manageFlowsService.saveFlow(flow).subscribe(resp => {
      //
    });
  }
}
