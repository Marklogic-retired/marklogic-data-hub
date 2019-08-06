import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import { Step } from '../../../models/step.model';
import {FlowsTooltips} from "../../../tooltips/flows.tooltips";
import { Flow } from '../../../models/flow.model';

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
        label: 'Delimited Text',
        value: 'csv',
      }
    ]
  },
  csvSeparator: {
    label: 'Field Separator',
    description: 'The delimited text file separator. Defaults to ,',
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
      },
      {
        label: 'Other',
        value: 'Other',
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
  selector: 'app-custom-ui',
  templateUrl: './custom-ui.component.html',
  styleUrls: ['./custom-ui.component.scss'],
})
export class CustomUiComponent implements OnInit{
  @Input() step: any;
  @Input() flow: Flow;
  @Input() module: string;
  inputFilePath: string;
  startPath: string;
  @Output() updateCustom = new EventEmitter();
  tooltips: any;
  OtherDelimiter: string;
  csvSep: string;


  
  constructor() {
  }

  ngOnInit(){
    this.tooltips = FlowsTooltips.custom;
    this.csvSep = this.defaultSep();
    this.OtherDelimiter = this.defaultOtherDelim();
  }

  config = settings;

  changeFolder(folder) {
    if (this.step.fileLocations.inputFilePath !== folder.absolutePath) {
      this.step.fileLocations.inputFilePath = folder.absolutePath;
      this.onChange();
    }
  }

  outputUriReplaceValue() {
    return `${this.step.fileLocations.outputURIReplacement.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:')}`;
  }

  onChange() {
    this.updateCustom.emit(this.step);
  }

  fieldSeparator() {
    if(this.csvSep !== 'Other'){
      this.step.fileLocations.separator = this.csvSep;
    } else {
      this.step.fileLocations.separator = this.OtherDelimiter;
    }

    this.onChange();
  }

  defaultSep(): string {
    let sep: string;
    sep = [',',';','|','\\t'].includes(this.step.fileLocations.separator) ? this.step.fileLocations.separator : 'Other';
    return sep;
  }

  defaultOtherDelim(): string {
    let othDelim: string;
    othDelim = [',',';','|','\\t'].includes(this.step.fileLocations.separator) ?  '' : this.step.fileLocations.separator;
    return othDelim;
  }

  createStepInitials(step: any): string {
    if (step.stepDefinitionType === 'INGESTION'){
      if(step.stepDefinitionName === 'default-ingestion'){
        return 'INGESTION';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === 'MAPPING'){
      if(step.stepDefinitionName === 'default-mapping'){
        return 'MAPPING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === 'MASTERING'){
      if(step.stepDefinitionName === 'default-mastering'){
        return 'MAPPING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else {
        return 'CUSTOM';
    }
  }
}
