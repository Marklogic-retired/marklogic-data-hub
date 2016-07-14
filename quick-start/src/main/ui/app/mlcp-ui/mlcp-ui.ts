import { Component, Input, ViewContainerRef, trigger,
   state, style, transition, animate, EventEmitter } from '@angular/core';

import { MdlSnackbarService } from 'angular2-mdl';

import * as _ from 'lodash';

import { ClipboardDirective } from 'angular2-clipboard';

import { FolderBrowser } from '../folder-browser/folder-browser.component';
import { SelectList } from '../select-list/select-list.component';
import { Select } from '../select/select.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

@Component({
  selector: 'mlcp',
  templateUrl: './mlcp-ui.html',
  providers: [],
  directives: [ClipboardDirective, FolderBrowser, SelectList, Select, TooltipDirective],
  styleUrls: ['./mlcp-ui.scss'],
  animations: [
    trigger('fadeState', [
      state('hidden', style({
        opacity: 0,
        visibility: 'hidden'
      })),
      state('active', style({
        opacity: 1,
        visibility: 'visible'
      })),
      transition('hidden => active', animate('0.5s ease-in')),
      transition('active => hidden', animate('0.5s ease-in'))
    ]),
    trigger('growState', [
      state('hidden', style({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      })),
      state('active', style({
        top: '*',
        left: '*',
        width: '*',
        height: '*',
      })),
      transition('hidden => active', animate('0.5s ease-in')),
      transition('active => hidden', animate('0.5s ease-in'))
    ]),
  ],
})
export class MlcpUi {
  inputFilePath: string = '.';
  mlcp = {};

  finishedEvent: EventEmitter<any>;

  startX: number = 0;
  startY: number = 0;

  vizState: string = 'hidden';

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
    'Aggregate XML Options': {
      collapsed: true
    },
    'Transform Options': {
      collapsed: true
    }
  };

  constructor(private snackbar: MdlSnackbarService, private vcRef: ViewContainerRef) {
    snackbar.setDefaultViewContainerRef(vcRef);
  }

  show(mlcpOptions, flow, $event): EventEmitter<boolean> {
    this.finishedEvent = new EventEmitter<boolean>(true);

    this.inputFilePath = mlcpOptions.input_file_path || '.';
    this.groups = this.getGroups(flow.entityName, flow.flowName, mlcpOptions);

    this.updateMlcpCommand();

    if ($event && $event.clientX >= 0 && $event.clientY >= 0) {
      this.startX = $event.clientX;
      this.startY = $event.clientY;
    }
    this.vizState = 'active';
    return this.finishedEvent;
  }

  /* tslint:disable:max-line-length */
  getGroups(entityName, flowName, previousOptions) {
    const groups = [
      {
        category: 'General Options',
        settings: [
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
            value: entityName + ',' + flowName + ',input',
          },
          {
            label: 'Output Permissions',
            field: 'output_permissions',
            type: 'comma-list',
            description: 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: -output_permissions role1,read,role2,update',
            value: 'rest-reader,read,rest-writer,update',
          },
          {
            label: 'Clean Target Database Directory?',
            field: 'output_cleandir',
            type: 'boolean',
            description: 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: -output_permissions role1,read,role2,update',
          },
          {
            label: 'Output URI Prefix',
            field: 'output_uri_prefix',
            type: 'string',
            description: 'URI prefix to the id specified by -output_idname. Used to construct output document URIs.',
          },
          {
            label: 'Output URI Suffix',
            field: 'output_uri_suffix',
            type: 'string',
            description: 'URI suffix to the id specified by -output_idname. Used to construct output document URIs.',
          },
          {
            label: 'Document Type',
            field: 'document_type',
            type: 'type',
            description: 'The type of document to create when -input_file_type is documents or sequencefile. Accepted values: mixed (documents only), xml, json, text, binary.\nDefault: mixed for documents, xml for sequencefile.',
            options: [
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
            placeholder: 'whether or not the source data is compressed',
          },
          {
            label: 'Input Compression Codec',
            field: 'input_compression_codec',
            type: 'type',
            description: 'When -input_compressed is true, the code used for compression. Accepted values: zip, gzip.',
            options: [
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
            placeholder: 'default namespace for all XML documents created during loading',
          },
          {
            label: 'XML Repair Level',
            field: 'xml_repair_level',
            type: 'string',
            description: 'The degree of repair to attempt on XML documents in order to create well-formed XML. Accepted values: default,full, none.\nDefault: default, which depends on the configured MarkLogic Server default XQuery version: In XQuery 1.0 and 1.0-ml the default is none. In XQuery 0.9-ml the default is full.',
            placeholder: 'default, full, or none',
          },
          {
            label: 'Thread Count',
            field: 'thread_count',
            type: 'number',
            description: 'The number of threads to spawn for concurrent loading. The total number of threads spawned by the process can be larger than this number, but this option caps the number of concurrent sessions with MarkLogic Server. Only available in local mode.\nDefault: 4.',
            placeholder: 'default is 4',
          },
          {
            label: 'Batch Size',
            field: 'batch_size',
            type: 'number',
            description: 'The number of documents to process in a single request to MarkLogic Server. This option is ignored when you use -transform_module; a transform always sets the batch size to 1.\nDefault: 100.',
            placeholder: 'default is 100; set to 1 when transform is used',
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
            description: 'When importing content with -input_file_type delimited_text, whether or not MarkLogic Server should automatically generate document URIs.\nDefault: false.',
            placeholder: 'default is false for delimited_text, true for delimited_json',
          },
          {
            label: 'Split Input?',
            field: 'split_input',
            type: 'boolean',
            description: 'Whether or not to divide input data into logical chunks to support more concurrency. Only supported when -input_file_type is one of the following: delimited_text.\nDefault: false for local mode, true for distributed mode. For details, see Improving Throughput with -split_input.',
            placeholder: 'whether or not to divide input data into logical chunks to support more concurrency.',
          },
          {
            label: 'Delimiter',
            field: 'delimiter',
            type: 'character',
            description: 'When importing content with -input_file_type delimited_text, the delimiting character.\nDefault: comma (,).',
            placeholder: 'default is comma',
          },
          {
            label: 'URI ID',
            field: 'delimited_uri_id',
            type: 'string',
            description: 'When importing content -input_file_type delimited_text, the column name that contributes to the id portion of the URI for inserted documents.\nDefault: The first column.',
            placeholder: 'default is first column',
          },
          {
            label: 'Delimited Root Name',
            field: 'delimited_root_name',
            type: 'string',
            description: 'When importing content with -input_file_type delimited_text, the localname of the document root element.\nDefault: root.',
            placeholder: 'default is root',
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
            field: 'aggregate_uri_id',
            type: 'string',
            description: 'When splitting an aggregate input file into multiple documents, the element or attribute name within the document root to use as the document URI.\nDefault: In local mode, hashcode-seqnum, where the hashcode is derived from the split number; in distribute mode, taskid-seqnum.',
            placeholder: 'name of the element from which to derive the document URI',
          },
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
            value: '/com.marklogic.hub/mlcp-flow-transform.xqy',
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
            value: '<params><entity-name>' + entityName + '</entity-name><flow-name>' + flowName + '</flow-name><flow-type>input</flow-type></params>',
            readOnly: true,
          },
        ],
        collapsed: true,
      },
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

  isGroupVisible(category) {
    const inputFileType = this.groups[0].settings[0].value;
    if (category === 'Delimited Text Options' && inputFileType !== 'delimited_text') {
      return false;
    } else if (category === 'Aggregate XML Options' && inputFileType !== 'aggregates') {
      return false;
    }
    return true;
  }

  isFieldVisible(filter, collection) {
    if (filter) {
      const field = filter.field;
      const value = filter.value;
      return this.getByFieldAndValue(field, value, collection);
    }
    return true;
  }

  getByFieldAndValue(field, value, collection) {
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


  isText(type) {
    if (type === 'string' || type === 'comma-list' || type === 'number' || type === 'character') {
      return true;
    }

    return false;
  }

  toggleSection(group) {
    const section = this.sections[group];
    section.collapsed = !section.collapsed;
  }

  getSectionCollapsed(group) {
    const section = this.sections[group];
    return section.collapsed;
  }

  getSectionClass(group) {
    const section = this.sections[group];
    return section.collapsed ? 'collapsed' : '';
  }

  buildMlcpOptions() {
    let options = [];

    this.addMlcpOption(options, 'import', null, false);
    this.addMlcpOption(options, 'mode', 'local', false);
    this.addMlcpOption(options, 'input_file_path', this.inputFilePath, true);
    this.addMlcpOption(options, 'output_uri_replace', '"' + this.inputFilePath + ',\'\'"', true);

    _.each(this.groups, (group) => {
      if (this.isGroupVisible(group.category)) {
        _.each(group.settings, (setting) => {
          if (setting.value) {
            const key = setting.field;
            let value = setting.value;
            if (setting.type !== 'boolean') {
              value = '"' + setting.value + '"';
            }
            this.addMlcpOption(options, key, value, true);
          }
        });
      }
    });
    return options;
  }

  addMlcpOption(options, key, value, isOtherOption) {
    options.push('-' + key);
    if (value) {
      options.push(value);
      if (isOtherOption) {
        this.mlcp[key] = value;
      }
    }
  }

  updateSetting(setting, value) {
    setting.value = value;
    this.updateMlcpCommand();
  }

  updateMlcpCommand() {
    let mlcpCommand = 'mlcp';
    mlcpCommand += (navigator.appVersion.indexOf('Win') !== -1) ? '.bat' : '.sh';

    mlcpCommand += ' ' + this.buildMlcpOptions().join(' ');

    this.mlcpCommand = mlcpCommand;
    return mlcpCommand;
  }

  folderClicked($event) {
    this.inputFilePath = $event;
    this.updateMlcpCommand();
  }

  cmdCopied() {
    this.snackbar.showSnackbar({
      message: 'MLCP command copied to the clipboard.',
    });
  }

  hide() {
    this.vizState = 'hidden';
  }

  private cancel() {
    this.hide();
    this.finishedEvent.error(false);
  }

  private runImport() {
    this.hide();
    this.finishedEvent.emit(this.mlcp);
  }
}
