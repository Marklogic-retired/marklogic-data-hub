import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

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
  @Input() projectDirectory: string;
  @Output() saveStep = new EventEmitter();
  constructor(
  ) {
  }

  ngOnInit(): void {
    this.checkDefaults();
  }

  /*
    Checking if the options are exist if not then initiate it with default value.
    This is the last barrier for the case if the backend has some options omitted.
   */
  private checkDefaults(): void {
    const {
      inputFilePath,
      inputFileType,
      outputURIReplacement
    } = this.step.fileLocations;

    const {
      collections,
      permissions,
      outputFormat
    } = this.step.options;

    const fileLocations = {
      inputFilePath: inputFilePath || this.projectDirectory || '.',
      inputFileType: inputFileType || 'json',
      outputURIReplacement: outputURIReplacement || ''
    };

    const options = {
      collections: collections || [`${this.step.name}`],
      permissions: permissions || "rest-reader,read,rest-writer,update",
      outputFormat: outputFormat || 'json'
    };

    this.step.fileLocations = fileLocations;
    this.step.options = options;
  }
}
