import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {IngestUiComponent} from "./ui/ingest-ui.component";

const configDefaults = {
  input_file_path: '.',
  input_file_type: 'documents',
  output_collections: '',
  output_permissions: 'rest-reader,read,rest-writer,update',
  document_type: 'json',
  transform_module: '/data-hub/5/transforms/mlcp-flow-transform.sjs',
  transform_namespace: 'http://marklogic.com/data-hub/mlcp-flow-transform',
  transform_param: ''
};

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
    const targetEntity = this.step.config.targetEntity;
    // if no config or not valid config, initialize with default
    if (!this.step.config || this.step.config.matchOptions) {
      this.step.config = {
        input_file_path: '.',
        input_file_type: 'documents',
        output_permissions: 'rest-reader,read,rest-writer,update',
        document_type: 'json',
        output_collections: `${targetEntity || ''}`,
        transform_module: '/data-hub/5/transforms/mlcp-flow-transform.sjs',
        transform_namespace: 'http://marklogic.com/data-hub/mlcp-flow-transform',
        transform_param: `entity-name=${targetEntity || ' '},flow-name=${this.flow.name}`,
        targetEntity: targetEntity
      };
    }
  }
}
