import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'app-job-export-ui',
  templateUrl: './job-export-ui.component.html'
})
export class JobExportUiComponent {
  @Input() question: string;
  @Output() exportClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();
}
