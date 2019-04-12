import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Step} from "../../../models/step.model";

const settings = {
  inputFilePath: {
    label: 'Input File Path',
    field: 'input_file_path',
    type: 'string',
    description: 'A regular expression describing the filesystem location(s) to use for input.',
    value: '.'
  },
  fileTypes: {
    label: 'Input File Type',
    field: 'input_file_type',
    type: 'type',
    description: 'The input file type. Accepted value: txt, json, xml, binary, csv, or all.\nDefault: json.',
    options: [
      {
        label: 'Text',
        value: 'txt',
      },
      {
        label: 'JSON',
        value: 'json',
      },
      {
        label: 'XML',
        value: 'xml',
      },
      {
        label: 'Binary',
        value: 'binary',
      },
      {
        label: 'CSV',
        value: 'csv',
      },
      {
        label: 'All',
        value: 'all',
      }
    ],
    value: 'json'
  },
  outputDocTypes: {
    label: 'Output File Type',
    field: 'document_type',
    type: 'type',
    description: 'The type of document to create when -input_file_type is documents, sequencefile or delimited_text. Accepted values: mixed (documents only), xml, json, text, binary. Default: mixed for documents, xml for sequencefile, and xml for delimited_text.',
    options: [
      {
        label: 'JSON',
        value: 'json',
      },
      {
        label: 'XML',
        value: 'xml',
      }
    ],
    value: 'json'
  },
  outputPermissions: {
    label: 'Output Permissions',
    field: 'output_permissions',
    type: 'comma-list',
    description: 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: -output_permissions role1,read,role2,update',
    value: 'rest-reader,read,rest-writer,update',
  },
};

@Component({
  selector: 'app-ingest-ui',
  templateUrl: './ingest-ui.component.html',
  styleUrls: ['./ingest-ui.component.scss']
})
export class IngestUiComponent implements OnInit {

  @Input() step: any;
  @Input() flow: any;
  @Output() saveStep = new EventEmitter();

  constructor() {
  }

  config = settings;
  folder: string;

  ngOnInit(): void {
    this.folder = this.step.options.input_file_path;
  }

  changeFolder(folder){
    this.folder = folder.relativePath;
    this.onChange();
  }

  onKeyChange(event) {
    if (event.key === 'Enter') {
      this.onChange();
    }
  }

  onChange() {
    if (this.step.options) {
      this.step.options.input_file_path = this.folder;
      this.step.options.transform_param = `entity-name=${this.step.options.targetEntity},flow-name=${this.flow.name}`;
      this.step.options.output_collections = `${this.step.options.targetEntity}`;
      this.saveStep.emit(this.step);
    }
  }

}
