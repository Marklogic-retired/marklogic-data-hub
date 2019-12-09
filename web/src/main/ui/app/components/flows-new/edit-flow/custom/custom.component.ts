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

  @Input() step: any;
  @Input() flow: Flow;
  @Input() module: string;
  @Input() projectDirectory: string;
  @Output() saveStep = new EventEmitter();
  private defaultOptions: any = ["additionalCollections",
  "collections",
  "headers",
  "outputFormat",
  "permissions",
  "sourceQuery",
  "sourceCollection",
  "sourceDatabase",
  "targetDatabase",
  "targetEntity"];

  constructor() {
  }

  ngOnInit(): void {
    if(this.step.stepDefinitionType === 'INGESTION'){
    this.checkDefaults();
    }
  }

  private checkDefaults(): void {
    const {
      inputFilePath,
      inputFileType,
      outputURIReplacement,
      separator
    } = this.step.fileLocations;

    const fileLocations = {
      inputFilePath: inputFilePath || this.projectDirectory || '.',
      inputFileType: inputFileType || 'json',
      outputURIReplacement: outputURIReplacement || '',
      separator: separator || ','
    };

    const options = {
      additionalCollections: this.step.options.additionalCollections || [],
      collections: this.step.options.collections || [`${this.step.name}`],
      permissions: this.step.options.permissions || "rest-reader,read,rest-writer,update",
      outputFormat: this.step.options.outputFormat || 'json',
      sourceQuery: this.step.options.sourceQuery || '',
      targetDatabase: this.step.options.targetDatabase || '',
      headers: this.step.options.headers || {
        sources: [{ name: this.flow.name }],
        createdOn: 'currentDateTime',
        createdBy: 'currentUser'
      }
    };

    let cOptions = {};
    for (var key in this.step.options) {
      if (this.step.options.hasOwnProperty(key) && !this.defaultOptions.includes(key)) {
        cOptions[key] = this.step.options[key];
      }
    }

    this.step.fileLocations = fileLocations;
    this.step.options = Object.assign(options, cOptions);
    
    
  }


}
