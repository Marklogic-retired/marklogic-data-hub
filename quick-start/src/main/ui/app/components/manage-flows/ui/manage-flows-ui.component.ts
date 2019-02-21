import { Component, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-manage-flows-ui',
  templateUrl: './manage-flows-ui.component.html',
  styleUrls: ['./manage-flows-ui.component.scss']
})
export class ManageFlowsUiComponent {

  @Input() flows: Array<Object> = new Array<Object>();

  friendlyDate(dt): string {
    return moment(dt).fromNow();
  }

}
