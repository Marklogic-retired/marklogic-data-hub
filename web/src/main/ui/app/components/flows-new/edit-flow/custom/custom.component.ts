import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Step} from '../../models/step.model';
import { Flow } from '../../models/flow.model';

@Component({
  selector: 'app-custom',
  template: `
    <app-custom-ui
      [step]="step"
      [flow]="flow"
      [module]="module"
      (updateCustom)="saveStep.emit($event)"
    ></app-custom-ui>
  `
})
export class CustomComponent  implements OnInit {

  @Input() step: Step;
  @Input() flow: Flow;
  @Input() module: string;
  @Input() projectDirectory: string;
  @Output() saveStep = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
    this.checkDefaults();
  }

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


}
