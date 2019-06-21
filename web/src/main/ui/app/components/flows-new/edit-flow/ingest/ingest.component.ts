import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Flow } from '../../models/flow.model';
import { Step } from '../../models/step.model';

@Component({
  selector: 'app-ingest',
  template: `
    <app-ingest-ui
      [step]="step"
      [flow]="flow"
      (saveStep)="saveStep.emit($event)"
      (clipboardSuccess)="cmdCopied()"
    >
    </app-ingest-ui>
  `
})
export class IngestComponent implements OnInit {
  @Input() step: Step;
  @Input() flow: Flow;
  @Input() projectDirectory: string;
  @Output() saveStep = new EventEmitter();
  constructor(
    private snackbar: MatSnackBar
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
      outputURIReplacement,
      separator
    } = this.step.fileLocations;

    const {
      additionalCollections,
      collections,
      permissions,
      outputFormat,
      sourceQuery,
      targetDatabase,
      headers
    } = this.step.options;

    const fileLocations = {
      inputFilePath: inputFilePath || this.projectDirectory || '.',
      inputFileType: inputFileType || 'json',
      outputURIReplacement: outputURIReplacement || '',
      separator: separator || ','
    };

    const options = {
      additionalCollections: additionalCollections || [],
      collections: collections || [`${this.step.name}`],
      permissions: permissions || "rest-reader,read,rest-writer,update",
      outputFormat: outputFormat || 'json',
      sourceQuery: sourceQuery || '',
      targetDatabase: targetDatabase || '',
      headers: headers || {
        sources: [{ name: this.flow.name }],
        createdOn: 'currentDateTime',
        createdBy: 'currentUser'
      }
    };

    this.step.fileLocations = fileLocations;
    this.step.options = options;
  }
  cmdCopied(): void {
    this.snackbar.open('MLCP command copied to the clipboard.', "", {
        panelClass: ['snackbar'], 
        duration: 1200
      });
  }
}
