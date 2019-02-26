import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Flow } from "../models/flow.model";
import { ManageFlowsService } from "../services/manage-flows.service";

@Component({
  selector: 'app-edit-flow',
  template: `
  <app-edit-flow-ui
    [flow]="flow"
  ></app-edit-flow-ui>
`
})
export class EditFlowComponent implements OnInit {
  constructor(
    private manageFlowsService: ManageFlowsService,
    private activatedRoute: ActivatedRoute
  ) { }

  public flow: Flow = new Flow();

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.manageFlowsService.getFlow(params['flowId']).subscribe(resp => {
        // let flowParsed = Flow.fromJSON(resp);
        // console.log('flowParsed', flowParsed);
        this.flow = Flow.fromJSON(resp);
      });
    });
  }

}
