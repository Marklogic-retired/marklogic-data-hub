import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';

const settings = {
  inputFilePath: {
    label: 'Source Directory Path',
    description: 'Fhe filesystem location(s) to use for input. Default is current project path relative to the server location',
    value: '.'
  },
  fileTypes: {
    label: 'Source Format',
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
  csvSeparator: {
    label: 'CSV Separator',
    description: 'The csv file separator. Defaults to ,',
    options: [
      {
        label: ',',
        value: ',',
      },
      {
        label: '|',
        value: '|',
      },
      {
        label: ';',
        value: ';',
      },
      {
        label: 'Tab',
        value: '\\t',
      }
    ]
  },
  outputDocTypes: {
    label: 'Target Format',
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
export class IngestUiComponent {

  @Input() step: any;
  @Input() flow: any;
  @Output() saveStep = new EventEmitter();

  constructor(private snackBar: MatSnackBar) {
  }

  config = settings;
  changeFolder(folder) {
    if (this.step.fileLocations.inputFilePath !== folder.absolutePath) {
      this.step.fileLocations.inputFilePath = folder.absolutePath;
      this.onChange();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    // allow the user to type a tab
    if (event.keyCode === 9) {
      if (event.currentTarget instanceof HTMLInputElement && event.currentTarget.attributes['allowTab']) {
        let target: HTMLInputElement = event.currentTarget as HTMLInputElement;
        target.value = "\t";
        event.preventDefault();
      }
    }
  }

  onChange() {
    this.saveStep.emit(this.step);
    this.snackBar.open("Change Saved.", "", {panelClass: ['snackbar'], duration: 1500});  }
}
