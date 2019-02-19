import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import * as _ from 'lodash';


@Component({
  selector: 'app-manage-flows-ui',
  templateUrl: './manage-flows-ui.component.html',
  styleUrls: ['./manage-flows-ui.component.scss']
})
export class ManageFlowsUiComponent {

  @Input() flows: Array<Object> = new Array<Object>();

  //@Output() showNewMapping = new EventEmitter();

}
