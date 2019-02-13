import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  ViewContainerRef
} from '@angular/core';

import { MdlSnackbarService } from '@angular-mdl/core';

import * as _ from 'lodash';

import { EntitiesService } from '../../models/entities.service';
import { Flow } from '../../models/flow.model';
import { EnvironmentService } from '../../services/environment';

interface MlcpOptions {
  [key: string]: any;
}

@Component({
  selector: 'app-mlcp',
  template: `
    <app-mlcp-ui
      [startPath]="startPath"
      [flow]="flow"
      [mlcpOptions]="mlcpOptions"
      [hasErrors]="hasErrors"
      [groups]="groups"
      [mlcpCommand]="mlcpCommand"
      (folderClicked)="folderClicked($event)"
      (fileClicked)="fileClicked($event)"
      (saveOptionsClicked)="saveOptions()"
      (valueChanged)="updateSetting()"
      (runImportClicked)="runImport()"
      (clipboardSuccess)="cmdCopied()"
      >
    </app-mlcp-ui>
  `,
})
export class MlcpComponent implements OnChanges {
  startPath: string;
  inputFilePath: string;
  mlcp = <MlcpOptions>{};

  @Input() flow: Flow;
  @Input() mlcpOptions: any;
  @Input() hasErrors: boolean;
  @Output() onRun: EventEmitter<MlcpOptions> = new EventEmitter();
  @Output() onErrorRun: EventEmitter<any> = new EventEmitter();

  finishedEvent: EventEmitter<any>;

  _isVisible = false;

  groups: Array<any>;

  mlcpCommand: string;

  sections: any = {
    inputFiles: {
      collapsed: false
    },
    'General Options': {
      collapsed: true
    },
    'Delimited Text Options': {
      collapsed: true
    },
    'Delimited Json Options': {
      collapsed: true
    },
    'Aggregate XML Options': {
      collapsed: true
    },
    'Transform Options': {
      collapsed: true
    }
  };

  constructor(
    private snackbar: MdlSnackbarService,
    private vcRef: ViewContainerRef,
    private entitiesService: EntitiesService,
    private envService: EnvironmentService
  ) {
  }

  ngOnChanges(changes: any) {
    if (changes.mlcpOptions && changes.mlcpOptions.currentValue) {
      this.show(changes.mlcpOptions.currentValue, this.flow);
    }
  }

  show(mlcpOptions: any, flow: Flow): EventEmitter<boolean> {
    this.finishedEvent = new EventEmitter<boolean>(true);

    this.flow = flow;

    // TODO: we need to make this more consistent than just enforcing it everytime quickstart loads up the flow
    mlcpOptions['transform_module'] = this.flow.transformModulePath();

    this.inputFilePath = this.startPath = mlcpOptions.input_file_path || '.';
    this.groups = this.getGroups(flow.entityName, flow.flowName, flow.dataFormat, mlcpOptions);

    this.updateMlcpCommand();

    this._isVisible = true;
    return this.finishedEvent;
  }

  /* tslint:disable:max-line-length */
  getGroups(entityName: string, flowName: string, dataFormat: string, previousOptions: any) {
    const groups = [
      {
        category: 'General Options',
        settings: [
          {
            label: 'Input File Path',
            field: 'input_file_path',
            type: 'string',
            description: 'A regular expression describing the filesystem location(s) to use for input.',
            value: `${this.inputFilePath}`
          },
          {
            label: 'Input File Type',
            field: 'input_file_type',
            type: 'type',
            description: 'The input file type. Accepted value: aggregates, archive, delimited_text, delimited_json, documents, forest, rdf, sequencefile.\nDefault: documents.',
            options: [
              {
                label: 'Aggregates',
                value: 'aggregates',
              },
              {
                label: 'Archive',
                value: 'archive',
              },
              {
                label: 'Delimited Text',
                value: 'delimited_text',
              },
              {
                label: 'Delimited Json',
                value: 'delimited_json',
              },
              {
                label: 'Documents',
                value: 'documents',
              },
              {
                label: 'Forest',
                value: 'forest',
              },
              {
                label: 'RDF',
                value: 'rdf',
              },
              {
                label: 'Sequence File',
                value: 'sequencefile',
              },
            ],
            value: 'documents'
          },
          {
            label: 'Output Collections',
            field: 'output_collections',
            type: 'comma-list',
            description: 'A comma separated list of collection URIs. Loaded documents are added to these collections.',
            value: entityName.replace(new RegExp(' ', 'g'), '') + ',' + flowName.replace(new RegExp(' ', 'g'), '') + ',input',
          },
          {
            label: 'Output Permissions',
            field: 'output_permissions',
            type: 'comma-list',
            description: 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: -output_permissions role1,read,role2,update',
            value: 'rest-reader,read,rest-writer,update',
          },
          {
            label: 'Output URI Prefix',
            field: 'output_uri_prefix',
            type: 'string',
            description: 'Specify a prefix to prepend to the default URI. Used to construct output document URIs. For details, see Controlling Database URIs During Ingestion.',
          },
          {
            label: 'Output URI Replace',
            field: 'output_uri_replace',
            type: 'string',
            description: 'A comma separated list of (regex,string) pairs that define string replacements to apply to the URIs of documents added to the database. The replacement strings must be enclosed in single quotes. For example, -output_uri_replace "regex1,\'string1\',regext2,\'string2\'"'
          },
          {
            label: 'Output URI Suffix',
            field: 'output_uri_suffix',
            type: 'string',
            description: 'Specify a suffix to append to the default URI Used to construct output document URIs. For details, see Controlling Database URIs During Ingestion.',
          },
          {
            label: 'Document Type',
            field: 'document_type',
            type: 'type',
            description: 'The type of document to create when -input_file_type is documents, sequencefile or delimited_text. Accepted values: mixed (documents only), xml, json, text, binary. Default: mixed for documents, xml for sequencefile, and xml for delimited_text.',
            options: [
              {
                label: '',
                value: null,
              },
              {
                label: 'mixed (documents only)',
                value: 'mixed',
              },
              {
                label: 'xml (default for sequence file)',
                value: 'xml',
              },
              {
                label: 'json',
                value: 'json',
              },
              {
                label: 'text',
                value: 'text',
              },
              {
                label: 'binary',
                value: 'binary',
              },
            ],
            value: dataFormat.toLowerCase(),
          },
          {
            label: 'Input File Pattern',
            field: 'input_file_pattern',
            type: 'string',
            description: 'Load only input files that match this regular expression from the path(s) matched by -input_file_path. For details, see Regular Expression Syntax.\nDefault: Load all files. This option is ignored when -input_file_type is forest.',
          },
          {
            label: 'Input Files are Compressed?',
            field: 'input_compressed',
            type: 'boolean',
            description: 'Whether or not the source data is compressed.\nDefault: false.',
          },
          {
            label: 'Input Compression Codec',
            field: 'input_compression_codec',
            type: 'type',
            description: 'When -input_compressed is true, the code used for compression. Accepted values: zip, gzip.',
            options: [
              {
                label: '',
                value: null,
              },
              {
                label: 'zip',
                value: 'zip',
              },
              {
                label: 'gzip',
                value: 'gzip',
              },
            ],
            filter: {
              field: 'input_compressed',
              value: 'true',
            },
          },
          {
            label: 'Namespace',
            field: 'namespace',
            type: 'string',
            description: 'The default namespace for all XML documents created during loading.',
          },
          {
            label: 'XML Repair Level',
            field: 'xml_repair_level',
            type: 'string',
            description: 'The degree of repair to attempt on XML documents in order to create well-formed XML. Accepted values: default,full, none.\nDefault: default, which depends on the configured MarkLogic Server default XQuery version: In XQuery 1.0 and 1.0-ml the default is none. In XQuery 0.9-ml the default is full.',
          },
          {
            label: 'Fastload',
            field: 'fastload',
            type: 'boolean',
            description: 'The -fastload option can significantly speed up ingestion during import and copy operations, but it can also cause problems if not used properly. When you use -fastload mlcp attempts to cut out the middle step by applying the document assignment policy on the client. Do NOT use -fastload to re-insert documents if the forest topology or assignment policy has changed since the document was originally inserted. Do NOT use -fastload if the forest topology or assignment policy will change as -fastload is running.',
          },
          {
            label: 'Thread Count',
            field: 'thread_count',
            type: 'number',
            description: 'The number of threads to spawn for concurrent loading. The total number of threads spawned by the process can be larger than this number, but this option caps the number of concurrent sessions with MarkLogic Server. Only available in local mode.\nDefault: 4.',
          },
          {
            label: 'Batch Size',
            field: 'batch_size',
            type: 'number',
            description: 'The number of documents to process in a single request to MarkLogic Server. This option is ignored when you use -transform_module; a transform always sets the batch size to 1.\nDefault: 100.',
          },
        ],
        collapsed: true,
      },
      {
        category: 'Delimited Text Options',
        caption: 'If the selected file ends in .csv, .xls, or .xlsx, the server will assume that the input file type is \'delimited_text\'.',
        settings: [
          {
            label: 'Generate URI?',
            field: 'generate_uri',
            type: 'boolean',
            description: 'Whether or not MarkLogic Server should automatically generate document URIs.\nDefault: false.',
          },
          {
            label: 'Split Input?',
            field: 'split_input',
            type: 'boolean',
            description: 'Whether or not to divide input data into logical chunks to support more concurrency. Only supported when -input_file_type is one of the following: delimited_text.\nDefault: false for local mode, true for distributed mode. For details, see Improving Throughput with -split_input.',
          },
          {
            label: 'Delimiter',
            field: 'delimiter',
            type: 'character',
            description: 'When importing content with -input_file_type delimited_text, the delimiting character.\nDefault: comma (,).',
          },
          {
            label: 'URI ID',
            field: 'uri_id',
            type: 'string',
            description: 'The column name that contributes to the id portion of the URI for inserted documents. Default: The first column.',
          },
          {
            label: 'Delimited Root Name',
            field: 'delimited_root_name',
            type: 'string',
            description: 'When importing content with -input_file_type delimited_text, the localname of the document root element.\nDefault: root.',
          },
          {
            label: 'Data Type',
            field: 'data_type',
            type: 'comma-list',
            description: 'When importing content with -input_file_type delimited_text and -document_type json, use this option to specify the data type (string, number, or boolean) to give to specific fields. The option value must be a comma separated list of name,datatype pairs, such as \'a,number,b,boolean\'.\nDefault: All fields have string type. For details, see Controlling Data Type in JSON Output.',
          },
        ],
        collapsed: true,
      },
      {
        category: 'Delimited Json Options',
        caption: 'If the selected file ends in .csv, .xls, or .xlsx, the server will assume that the input file type is \'delimited_text\'.',
        settings: [
          {
            label: 'Generate URI?',
            field: 'generate_uri',
            type: 'boolean',
            description: 'Whether or not MarkLogic Server should automatically generate document URIs.\nDefault: false.',
          },
          {
            label: 'URI ID',
            field: 'uri_id',
            type: 'string',
            description: 'The element, attribute, or property name within the document to use as the document URI. Default: None; the URI is based on the file name, as described in Default Document URI Construction.',
          }
        ],
        collapsed: true
      },
      {
        category: 'Aggregate XML Options',
        settings: [
          {
            label: 'Aggregate Record Element',
            field: 'aggregate_record_element',
            type: 'string',
            description: 'When splitting an aggregate input file into multiple documents, the name of the element to use as the output document root.\nDefault: The first child element under the root element.',
          },
          {
            label: 'Aggregate Record Namespace',
            field: 'aggregate_record_namespace',
            type: 'string',
            description: 'The namespace of the element specificed by -aggregate_record_element_name.\nDefault: No namespace.',
          },
          {
            label: 'URI ID',
            field: 'uri_id',
            type: 'string',
            description: 'The element, attribute, or property name within the document to use as the document URI. Default: None; the URI is based on the file name, as described in Default Document URI Construction.',
          }
        ],
        collapsed: true,
      },
      {
        category: 'Transform Options',
        settings: [
          {
            label: 'Transform Module',
            field: 'transform_module',
            type: 'string',
            description: 'The path in the modules database or modules directory of a custom content transformation function installed on MarkLogic Server. This option is required to enable a custom transformation. For details, see Transforming Content During Ingestion.',
            value: this.flow.transformModulePath(),
            readOnly: true,
          },
          {
            label: 'Transform Namespace',
            field: 'transform_namespace',
            type: 'string',
            description: 'The namespace URI of the custom content transformation function named by -transform_function. Ignored if-transform_module is not specified.\nDefault: no namespace. For details, see Transforming Content During Ingestion.',
            value: 'http://marklogic.com/data-hub/mlcp-flow-transform',
            readOnly: true,
          },
          {
            label: 'Transform Param',
            field: 'transform_param',
            type: 'string',
            description: 'Optional extra data to pass through to a custom transformation function. Ignored if -transform_module is not specified.\nDefault: no namespace. For details, see Transforming Content During Ingestion.',
            value: `entity-name=${encodeURIComponent(entityName)},flow-name=${encodeURIComponent(flowName)}`,
            readOnly: true,
          },
        ],
        collapsed: true,
      }
    ];
    _.each(previousOptions, (value, key) => {
      _.each(groups, (group) => {
        _.each(group.settings, (setting: any) => {
          if (setting.field === key) {
            setting.value = (value && value.replace) ? value.replace(/"/g, '') : value;
          }
        });
      });
    });
    return groups;
  }
  /* tslint:enable:max-line-length */

  isGroupVisible(category: string): boolean {
    const inputFileType = this.groups[0].settings[1].value;
    if (category === 'Delimited Text Options' && inputFileType !== 'delimited_text') {
      return false;
    } else if (category === 'Delimited Json Options' && inputFileType !== 'delimited_json') {
      return false;
    } else if (category === 'Aggregate XML Options' && inputFileType !== 'aggregates') {
      return false;
    }
    return true;
  }

  isFieldVisible(filter: any, collection: Array<any>): boolean {
    if (filter) {
      const field = filter.field;
      const value = filter.value;
      return this.getByFieldAndValue(field, value, collection);
    }
    return true;
  }

  getByFieldAndValue(field: any, value: any, collection: Array<any>) {
    let i = 0;
    const len = collection.length;
    for (; i < len; i++) {
      if (String(collection[i].field) === String(field) &&
          String(collection[i].value) === String(value)) {
        return collection[i];
      }
    }
    return null;
  }


  isText(type: string): boolean {
    if (type === 'string' || type === 'comma-list' || type === 'number' || type === 'character') {
      return true;
    }

    return false;
  }

  toggleSection(group: string): void {
    const section = this.sections[group];
    section.collapsed = !section.collapsed;
  }

  getSectionCollapsed(group: string): boolean {
    const section = this.sections[group];
    return section.collapsed;
  }

  getSectionClass(group: string): string {
    const section = this.sections[group];
    return section.collapsed ? 'collapsed' : '';
  }

  buildMlcpOptions(): Array<any> {
    const options: Array<any> = [];

    this.mlcp = {};
    this.addMlcpOption(options, 'import', null, false, false);
    this.addMlcpOption(options, 'mode', 'local', false, true);

    const host = this.envService.settings.host;
    const port = this.envService.settings.stagingPort;
    const username = this.envService.settings.username;


    this.addMlcpOption(options, 'host', host, false, true);
    this.addMlcpOption(options, 'port', port, false, true);
    this.addMlcpOption(options, 'username', username, false, true);
    this.addMlcpOption(options, 'password', '*****', false, true);

    _.each(this.groups, (group) => {
      if (this.isGroupVisible(group.category)) {
        _.each(group.settings, (setting: any) => {
          if (setting.value) {
            const key = setting.field;
            const value = setting.value;
            this.addMlcpOption(options, key, value, true, true);
          }
        });
      }
    });
    return options;
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

  updateSetting(): void {
    // use setTimeout to solve ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(this.updateMlcpCommand(), 0);
  }

  updateMlcpCommand(): string {
    let mlcpCommand = 'mlcp';
    mlcpCommand += (navigator.appVersion.indexOf('Win') !== -1) ? '.bat' : '.sh';
    mlcpCommand += ' ' + this.buildMlcpOptions().join(' ');

    this.mlcpCommand = mlcpCommand;

    return mlcpCommand;
  }

  outputUriReplaceValue() {
    return `${this.inputFilePath.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:')},''`;
  }

  folderClicked(folders: any): void {
    if (this.inputFilePath !== folders.absolutePath) {
      // Update Input File Path
      const generalGroup = _.find(this.groups, (group: any) => {
        return group.category === 'General Options';
      });
      const inputFilePath = _.find(generalGroup.settings, (setting: any) => {
        return setting.field === 'input_file_path';
      });
      inputFilePath.value = folders.absolutePath;
      this.inputFilePath = inputFilePath.value;

      // update the outputUriReplace options
      const outputUriReplace = _.find(generalGroup.settings, (setting: any) => {
        return setting.field === 'output_uri_replace';
      });
      outputUriReplace.value = this.outputUriReplaceValue();

      this.updateMlcpCommand();
    }
  }

  fileClicked(file: any): void {
    if (this.inputFilePath !== file.absolutePath) {
      this.inputFilePath = file.absolutePath;
      this.updateMlcpCommand();
    }
  }

  cmdCopied(): void {
    this.snackbar.showSnackbar({
      message: 'MLCP command copied to the clipboard.',
    });
  }

  hide(): void {
    this._isVisible = false;
  }

  isVisible(): boolean {
    return this._isVisible;
  }

  saveOptions(): void {
    this.entitiesService.saveInputFlowOptions(this.flow, this.mlcp).subscribe(() => {
      this.snackbar.showSnackbar({
        message: 'MLCP options saved.'
      });
    });
  }

  runImport(): void {
    if (this.hasErrors) {
      this.onErrorRun.emit(null);
    } else {
      this.onRun.emit(this.mlcp);
    }
  }
}
