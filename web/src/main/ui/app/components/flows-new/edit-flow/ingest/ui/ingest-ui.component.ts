import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

const settings = {
  inputFilePath: {
    label: 'Input File Path',
    field: 'inputFilePath',
    type: 'string',
    description: 'Fhe filesystem location(s) to use for input. Default is current project path relative to the server location',
    value: '.'
  },
  fileTypes: {
    label: 'Input File Type',
    field: 'inputFileType',
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
    field: 'outputFileType',
    type: 'type',
    description: 'The type of document to create. Accepted values: xml, json. Default: json.',
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
    field: 'outputPermissions',
    description: 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: role1,read,role2,update',
    value: 'rest-reader,read,rest-writer,update',
  },
  outputURIReplacement: {
    label: 'Output URI Replacement',
    field: 'outputURIReplacement',
    description: 'Specify a prefix to prepend to the default URI. Used to construct output document URIs. For details, see Controlling Database URIs During Ingestion.',
    value: ''
  }
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
    this.folder = this.step.options.inputFilePath;
    console.log('init done')
  }

  changeFolder(folder) {
    this.folder = folder.relativePath;
    this.onChange();
  }

  onKeyChange(event) {
    if (event.key === 'Enter') {
      this.onChange();
    }
  }

  onChange() {
    this.step.options.inputFilePath = this.folder;
    this.step.options.collections = [`${this.step.name}`];
    this.saveStep.emit(this.step);
  }

}
