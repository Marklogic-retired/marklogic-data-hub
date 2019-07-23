import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FlowsTooltips} from "../../../tooltips/flows.tooltips";
import { EntitiesService } from '../../../../../models/entities.service';
import { Flow } from '../../../models/flow.model';
import * as _ from 'lodash';
import { EnvironmentService } from '../../../../../services/environment';
import { Step } from '../../../models/step.model';

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
  },
  outputURIPreview :{
    label: 'Target URI Preview (Read-Only)',
    description: 'Previews the URI of the ingested documents'
  }
};
interface MlcpOptions {
  [key: string]: any;
}

@Component({
  selector: 'app-ingest-ui',
  templateUrl: './ingest-ui.component.html',
  styleUrls: ['./ingest-ui.component.scss']
})
export class IngestUiComponent implements OnInit{

  @Input() step: Step;
  @Input() flow: Flow;
  @Output() saveStep = new EventEmitter();
  @Output() clipboardSuccess = new EventEmitter();
  tooltips: any;
  groups: Array<any>;
  mlcp = <MlcpOptions>{};
  inputFilePath: string;
  startPath: string;
  @Output() finishedEvent: EventEmitter<boolean>;
  _isVisible: boolean;
  mlcpCommand: string;
  uri:string;
  OtherDelimiter: string;
  csvSep: string;

  constructor(
    private entitiesService: EntitiesService,
    private envService: EnvironmentService,
  ) {
  }

  ngOnChanges(){
    this.updateMlcpCommand();
  }

  ngDoCheck() {
    this.updateMlcpCommand();
  }

  ngOnInit(): void {
    this.tooltips = FlowsTooltips.ingest;
    this.csvSep = this.defaultSep();
    this.OtherDelimiter = this.defaultOtherDelim();
    this.buildURIPreview();
    this.updateMlcpCommand();
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

  buildMlcpOptions(): Array<any> {
    const options: Array<any> = [];

    this.mlcp = {};
    this.addMlcpOption(options, 'import', null, false, false);
    this.addMlcpOption(options, 'mode', 'local', false, true);

    const host = this.envService.settings.host;
    const port = this.envService.settings.stagingPort;
    const username = this.envService.settings.mlUsername;
    let input_file_path = this.step.fileLocations.inputFilePath;
    let in_file_tp = this.step.fileLocations.inputFileType;
    let input_file_type = (in_file_tp !== 'csv' ) ? 'documents':'delimited_text';
    let document_type = this.step.options.outputFormat.toLowerCase();
    let delimiter = this.step.fileLocations.separator;
    let output_permissions = this.step.options.permissions;
    let step_number = String(this.flow.steps.findIndex(i => i.id === this.step.id)+1);
    let transform_param = `flow-name=${encodeURIComponent(this.flow.name)},step=${encodeURIComponent(step_number)}`
    let collections = this.step.options.collections;
    let output_uri_replace = this.outputUriReplaceValue();
    this.addMlcpOption(options, 'host', host, false, true);
    this.addMlcpOption(options, 'port', port, false, true);
    this.addMlcpOption(options, 'username', username, false, true);
    this.addMlcpOption(options, 'password', '*****', false, true);
    this.addMlcpOption(options, 'input_file_path', input_file_path, false, true);
    this.addMlcpOption(options, 'input_file_type', input_file_type, false, true);
    (input_file_type === 'delimited_text')? (this.addMlcpOption(options, 'generate_uri', 'true', false, true)):'';
    (input_file_type === 'delimited_text' && delimiter !== ',')? (this.addMlcpOption(options, 'delimiter', delimiter, false, true)):'';
    this.addMlcpOption(options, 'output_collections', collections, false, true);
    (output_permissions)? this.addMlcpOption(options, 'output_permissions', output_permissions, false, true):'';
    (output_uri_replace)? this.addMlcpOption(options, 'output_uri_replace', output_uri_replace, false, true):'';
    this.addMlcpOption(options, 'document_type', document_type, false, true);
    this.addMlcpOption(options, 'transform_module', '/data-hub/5/transforms/mlcp-flow-transform.sjs', false, true);
    this.addMlcpOption(options, 'transform_namespace', 'http://marklogic.com/data-hub/mlcp-flow-transform', false, true);
    this.addMlcpOption(options, 'transform_param', transform_param, false, true);

    return options;
  }
  isGroupVisible(category: any) {
    throw new Error("Method not implemented.");
  }

  addMlcpOption(options: any, key: string, value: any, isOtherOption: boolean, appendDash: boolean): void {
    if (appendDash) {
      options.push('-' + key);
    } else {
      options.push(key);
    }

    if (value) {
      if (isOtherOption) {
        this.mlcp[key] = value;
      }
      if (value.type !== 'boolean' && value.type !== 'number') {
        value = '"' + value + '"';
      }
      options.push(value);
    }
  }

  updateMlcpCommand(): string {
    let mlcpCommand = 'mlcp';
    mlcpCommand += (navigator.appVersion.indexOf('Win') !== -1) ? '.bat' : '.sh';
    mlcpCommand += ' ' + this.buildMlcpOptions().join(' ');

    this.mlcpCommand = mlcpCommand;

    return mlcpCommand;
  }

  outputUriReplaceValue() {
    return `${this.step.fileLocations.outputURIReplacement.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:')}`;
  }

  onChange() {
    this.saveStep.emit(this.step);
    this.buildURIPreview();
    this.updateMlcpCommand();
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
}
