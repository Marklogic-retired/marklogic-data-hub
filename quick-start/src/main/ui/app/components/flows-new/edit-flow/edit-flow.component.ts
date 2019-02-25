import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {Flow} from "../models/flow.model";


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
  ) { }

  @Input() flow: Flow;

  ngOnInit() {

  }

}
