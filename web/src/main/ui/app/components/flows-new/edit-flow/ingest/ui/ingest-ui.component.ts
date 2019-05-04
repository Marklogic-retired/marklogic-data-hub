import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

const settings = {
  inputFilePath: {
    label: 'Source File Path',
    description: 'Fhe filesystem location(s) to use for input. Default is current project path relative to the server location',
    value: '.'
  },
  fileTypes: {
    label: 'Source File Type',
    description: 'The input file type. Accepted value: txt, json, xml, binary, csv, or all.\nDefault: json.',
    options: [
      {
        label: 'Text',
        value: 'text',
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
      }
    ]
  },
  outputDocTypes: {
    label: 'Target File Type',
    description: 'The type of document to create. Accepted values: xml, json. Default: json.',
    options: [
      {
        label: 'Text',
        value: 'text',
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
      }
    ]
  },
  outputPermissions: {
    label: 'Target Permissions',
    description: 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: role1,read,role2,update',
    value: 'rest-reader,read,rest-writer,update',
  },
  outputURIReplacement: {
    label: 'Target URI Replacement',
    description: 'Specify a prefix to prepend to the default URI. Used to construct output document URIs. For details, see Controlling Database URIs During Ingestion.'
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
    this.folder = this.step.fileLocations.inputFilePath;
  }

  changeFolder(folder) {
    if (this.folder !== folder.absolutePath) {
      this.folder = folder.absolutePath;
      this.onChange();
    }
  }

  onKeyChange(event) {
    if (event.key === 'Enter') {
      this.onChange();
    }
  }

  onChange() {
    this.step.fileLocations.inputFilePath = this.folder;
    this.step.options.collections = [`${this.step.name}`];
    this.saveStep.emit(this.step);
  }

}
