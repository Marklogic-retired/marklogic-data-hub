import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import { Step } from '../../../models/step.model';
import { MatDialog } from '@angular/material';
import {FlowsTooltips} from "../../../tooltips/flows.tooltips";
import { Flow } from '../../../models/flow.model';
import { AlertDialogComponent } from '../../../../common';
import { ManageFlowsService } from "../../../services/manage-flows.service";

const settings = {
  inputFilePath: {
    label: 'Source Directory Path',
    description: 'The filesystem location(s) to use for input. Default is current project path relative to the server location',
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
  },
  outputURIPreview :{
    label: 'Target URI Preview (Read-Only)',
    description: 'Previews the URI of the ingested documents'
  }
};


@Component({
  selector: 'app-custom-ui',
  templateUrl: './custom-ui.component.html',
  styleUrls: ['./custom-ui.component.scss'],
})
export class CustomUiComponent implements OnInit{
  @Input() step: Step;
  @Input() flow: Flow;
  @Input() module: string;
  inputFilePath: string;
  startPath: string;
  @Output() updateCustom = new EventEmitter();
  tooltips: any;
  OtherDelimiter: string;
  csvSep: string;
  uri:string;


  constructor(private manageFlowsService: ManageFlowsService,public dialog: MatDialog) {
  }

  ngOnInit(){
    this.tooltips = FlowsTooltips.custom;
    if(this.step.stepDefinitionType === 'INGESTION'){
    this.csvSep = this.defaultSep();
    this.OtherDelimiter = this.defaultOtherDelim();
    this.buildURIPreview();
    }
  }

  openValidateDialog(flow: Flow, step: any): void {
    let title;
    this.manageFlowsService.validateStep(this.flow.name, this.step.name + "-" + this.step.stepDefinitionType.toLowerCase()).subscribe(resp => {
    if(resp["valid"]) {
      title = "Validation Successful";
    }
    else {
      title = "Validation Failed";
    }
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '650px',
      data: {title: title, alertMessage: resp["response"] }
    });
    });
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
    this.buildURIPreview();
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
      if(step.stepDefinitionName === 'default-mapping' || step.stepDefinitionName === 'entity-services-mapping'){
        return 'MAPPING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === 'MASTERING'){
      if(step.stepDefinitionName === 'default-mastering'){
        return 'MASTERING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === 'MATCHING'){
      if(step.stepDefinitionName === 'default-matching'){
        return 'MATCHING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === 'MERGING'){
      if(step.stepDefinitionName === 'default-merging'){
        return 'MERGING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else {
        return 'CUSTOM';
    }
  }

  buildURIPreview(): void {
    let uri;
    let input_file_path = this.step.fileLocations.inputFilePath;
    let input_file_type = this.step.fileLocations.inputFileType;
    let document_type = this.step.options.outputFormat.toLowerCase();
    let output_uri_replace = this.step.fileLocations.outputURIReplacement;
    var formatMap = new Map();

    formatMap.set("xml", ".xml");
    formatMap.set("json", ".json");
    formatMap.set("text", ".txt");
    formatMap.set("binary", ".pdf");

    if(navigator.appVersion.indexOf('Win') !== -1){
      uri = "/" + input_file_path.replace(":", "").replace(/\\/g,"/");
    }
    else {
      uri = input_file_path;
    }

    if(input_file_type !== "csv") {
      uri = uri + "/example" + formatMap.get(document_type);
    }

    if (output_uri_replace) {
      let replace = output_uri_replace.split(",");
      if (replace.length % 2 !== 0) {
        this.uri = "Error: Missing one (or more) replacement strings";
        return;
      }
      for (var i = 0; i < replace.length - 1; i++) {
        let replacement = replace[++i].trim();
        if (!replacement.startsWith("'") ||
            !replacement.endsWith("'")) {
          this.uri = "Error: The replacement string must be enclosed in single quotes";
          return;
        }
      }
      for (var i = 0; i < replace.length - 1; i += 2) {
        let replacement = replace[i + 1].trim();
        replacement = replacement.substring(1, replacement.length - 1);
        try{
          uri = uri.replace(new RegExp(replace[i], 'g'), replacement);
        }
        catch(ex) {
          this.uri = ex;
          return;
        }
      }
    }
    if(input_file_type.toLowerCase() === "csv") {
      uri = uri + "/" + this.uuid() + formatMap.get(document_type);
    }
    this.uri = uri;
  }

  uuid() {
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;

      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += "-"
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }
}
