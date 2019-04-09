import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {IngestUiComponent} from "./ui/ingest-ui.component";

@Component({
  selector: 'app-ingest',
  template: `
    <app-ingest-ui
      [step]="step"
      [flow]="flow"
      (saveStep)="saveStep.emit($event)"
    >
    </app-ingest-ui>
  `
})
export class IngestComponent implements OnInit {
  @Input() step: any;
  @Input() flow: any;
  @Output() saveStep = new EventEmitter();

  ngOnInit(): void {
    this.checkDefaults();
  }

  private checkDefaults(): void {
    const targetEntity = this.step.options.targetEntity;
    // if no config or not valid config, initialize with default
    // TODO: better way to house-keep ingest options in the Step schema
    if (!this.step.options || this.step.options.matchOptions) {
      this.step.options = {
        inputFilePath: '.',
        inputFileType: 'json',
        outputCollections: `${targetEntity || ''}`,
        outputPermissions: 'rest-reader,read,rest-writer,update',
        outputFileType: 'json',
        outputURIReplacement: '',
        targetEntity: targetEntity
      };
    }
  }
}
