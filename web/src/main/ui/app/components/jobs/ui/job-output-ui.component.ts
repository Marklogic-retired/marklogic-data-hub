import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'app-job-output-ui',
  templateUrl: './job-output-ui.component.html',
  styleUrls: ['./job-output-ui.component.scss'],
})
export class JobOutputUiComponent {
  @Input() job: any;
  @Input() jobOutput: Array<any>;
  @Output() cancelClicked = new EventEmitter();
}
