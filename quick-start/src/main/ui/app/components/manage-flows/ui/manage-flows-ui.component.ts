import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-manage-flows-ui',
  templateUrl: './manage-flows-ui.component.html',
  styleUrls: ['./manage-flows-ui.component.scss']
})
export class ManageFlowsUiComponent {

  @Input() flows: Array<Object> = new Array<Object>();

  @Output() deleteFlow = new EventEmitter();
  @Output() createFlow = new EventEmitter();

  friendlyDate(dt): string {
    return moment(dt).fromNow();
  }

  onCreateFlow(newFlow) {
    this.createFlow.emit(newFlow);
  }

  onDeleteFlow(flowId) {
    this.deleteFlow.emit(flowId);
  }
}
