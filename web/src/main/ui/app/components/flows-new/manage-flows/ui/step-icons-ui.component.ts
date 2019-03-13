import {Component, Input} from "@angular/core";

@Component({
  selector: 'step-icons-ui',
  templateUrl: './step-icons-ui.component.html',
  styleUrls: ['./step-icons-ui.component.scss']
})
export class StepIconsUiComponent {
  @Input() steps: Array<Object> = new Array<Object>();

}
