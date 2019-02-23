import {Component} from "@angular/core";
import {flowsModelArray} from "./stories/flows-page.data";

@Component({
  selector: 'flows-page',
  template: `<flows-page-ui [flows]="this.flows"></flows-page-ui>`
})
export class FlowsPageComponent {
  flows: any;
  constructor(){
    this.flows = flowsModelArray;
  }
}
