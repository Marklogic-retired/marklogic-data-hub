import {MdlModule} from '@angular-mdl/core';
import {Http} from '@angular/http';
import {CommonModule} from '@angular/common';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {action} from '@storybook/addon-actions';
import { TooltipModule } from 'ngx-bootstrap';
import {of as observableOf, Observable} from 'rxjs';

import {MlcpUiComponent} from '../ui';
import {ThemeModule} from '../..';
import {StoryCardComponent} from '../../../utils';
import {FolderBrowserUiComponent} from '../../folder-browser/ui';
import {FolderBrowserComponent} from '../../folder-browser';
import {SelectComponent} from '../..';
import {ClipboardDirective} from '../../../directives/clipboard';

class MockHttp {
  get(uri: string) {
    if (uri.startsWith('/api/utils/searchPath')) {
      const mockJson = JSON.parse('{"currentAbsolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare","folders":[{"name":"..","relativePath":"../examples","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples"},{"name":"input","relativePath":"../examples/healthcare/input","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input"},{"name":"plugins","relativePath":"../examples/healthcare/plugins","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins"},{"name":"gradle","relativePath":"../examples/healthcare/gradle","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/gradle"},{"name":"src","relativePath":"../examples/healthcare/src","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src"}],"files":[{"name":"README.md","relativePath":"../examples/healthcare/README.md","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/README.md"},{"name":"gradle-local.properties","relativePath":"../examples/healthcare/gradle-local.properties","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/gradle-local.properties"},{"name":"build.gradle","relativePath":"../examples/healthcare/build.gradle","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/build.gradle"},{"name":"gradle.properties","relativePath":"../examples/healthcare/gradle.properties","absolutePath":"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/gradle.properties"}],"currentPath":"../examples/healthcare"}'
      );
      return observableOf({
        json: () => {
          return mockJson;
        }
      });
    }
  }
}

storiesOf('Components|MLCP', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [
        CommonModule,
        ThemeModule,
        MdlModule,
        TooltipModule.forRoot()
      ],
      schemas: [],
      declarations: [
        FolderBrowserUiComponent,
        FolderBrowserComponent,
        MlcpUiComponent,
        StoryCardComponent,
        SelectComponent,
        ClipboardDirective,
      ],
      entryComponents: [],
      providers: [
        {provide: Http, useClass: MockHttp}
      ]
    })
  )
  .addDecorator(centered)
  .add('mlcp-ui Component', () => ({
      template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="'1300px'" [height]="'800px'">
                  <app-mlcp-ui width="100%" min-width="500px"
                    [startPath]="startPath"
                    [flow]="flow"
                    [mlcpOptions]="mlcpOptions"
                    [hasErrors]="hasErrors"
                    [groups]="groups"
                    [mlcpCommand]="mlcpCommand"
                    (folderClicked)="folderClicked($event)"
                    (fileClicked)="fileClicked($event)"
                    (saveOptionsClicked)="saveOptionsClicked()"
                    (switchChanged)="switchChanged($event)"
                    (runImportClicked)="runImportClicked()"
                    (clipboardSuccess)="clipboardSuccess"
                  >
                  </app-mlcp-ui>
                </mlui-story-card>
           </mlui-dhf-theme>`,
      props: {
        startPath: text('startPath', '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input'),
        flow: object('flow', sampleFlow),
        mlcpOptions: object('mlcpOptions', sampleMlcpOptions),
        hasErrors: boolean('hasErrors', false),
        groups: object('groups', sampleGroups),
        mlcpCommand: text('mlcpCommand', sampleMlcpCommand),
        folderClicked: action('folderClicked'),
        fileClicked: action('fileClicked'),
        saveOptionsClicked: action('saveOptionsClicked'),
        switchChanged: action('switchChanged'),
        runImportClicked: action('runImportClicked'),
        clipboardSuccess: action('clipboardSuccess')
      }
    })
  );

const sampleMlcpCommand = 'mlcp.sh import -mode \"local\" -host \"localhost\" -port \"8010\" -username -password \"*****\" -input_file_path \"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input\" -input_file_type \"documents\" -output_collections \"Patients,nppes,input\" -output_permissions \"rest-reader,read,rest-writer,update\" -output_uri_replace \"/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input,\" -document_type \"xml\" -transform_module \"/data-hub/4/transforms/mlcp-flow-transform.xqy\" -transform_namespace \"http://marklogic.com/data-hub/mlcp-flow-transform\" -transform_param \"entity-name=Patients,flow-name=nppes\"';

const sampleMlcpOptions = {
  'input_file_path': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input',
  'input_file_type': 'documents',
  'output_collections': 'Patients,nppes,input',
  'output_permissions': 'rest-reader,read,rest-writer,update',
  'output_uri_replace': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input',
  'document_type': 'xml',
  'transform_module': '/data-hub/4/transforms/mlcp-flow-transform.xqy',
  'transform_namespace': 'http://marklogic.com/data-hub/mlcp-flow-transform',
  'transform_param': 'entity-name=Patients,flow-name=nppes'
};

const sampleGroups = [
  {
    'category': 'General Options',
    'settings': [
      {
        'label': 'Input File Path',
        'field': 'input_file_path',
        'type': 'string',
        'description': 'A regular expression describing the filesystem location(s) to use for input.',
        'value': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input'
      },
      {
        'label': 'Input File Type',
        'field': 'input_file_type',
        'type': 'type',
        'description': 'The input file type. Accepted value: aggregates, archive, delimited_text, delimited_json, documents, forest, rdf, sequencefile.\nDefault: documents.',
        'options': [
          {
            'label': 'Aggregates',
            'value': 'aggregates'
          },
          {
            'label': 'Archive',
            'value': 'archive'
          },
          {
            'label': 'Delimited Text',
            'value': 'delimited_text'
          },
          {
            'label': 'Delimited Json',
            'value': 'delimited_json'
          },
          {
            'label': 'Documents',
            'value': 'documents'
          },
          {
            'label': 'Forest',
            'value': 'forest'
          },
          {
            'label': 'RDF',
            'value': 'rdf'
          },
          {
            'label': 'Sequence File',
            'value': 'sequencefile'
          }
        ],
        'value': 'documents'
      },
      {
        'label': 'Output Collections',
        'field': 'output_collections',
        'type': 'comma-list',
        'description': 'A comma separated list of collection URIs. Loaded documents are added to these collections.',
        'value': 'Patients,nppes,input'
      },
      {
        'label': 'Output Permissions',
        'field': 'output_permissions',
        'type': 'comma-list',
        'description': 'A comma separated list of (role,capability) pairs to apply to loaded documents.\nDefault: The default permissions associated with the user inserting the document.\n\nExample: -output_permissions role1,read,role2,update',
        'value': 'rest-reader,read,rest-writer,update'
      },
      {
        'label': 'Output URI Prefix',
        'field': 'output_uri_prefix',
        'type': 'string',
        'description': 'Specify a prefix to prepend to the default URI. Used to construct output document URIs. For details, see Controlling Database URIs During Ingestion.'
      },
      {
        'label': 'Output URI Replace',
        'field': 'output_uri_replace',
        'type': 'string',
        'description': 'A comma separated list of (regex,string) pairs that define string replacements to apply to the URIs of documents added to the database. The replacement strings must be enclosed in single quotes. For example, -output_uri_replace \'regex1,\'string1\',regext2,\'string2\'\'',
        'value': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input,'
      },
      {
        'label': 'Output URI Suffix',
        'field': 'output_uri_suffix',
        'type': 'string',
        'description': 'Specify a suffix to append to the default URI Used to construct output document URIs. For details, see Controlling Database URIs During Ingestion.'
      },
      {
        'label': 'Document Type',
        'field': 'document_type',
        'type': 'type',
        'description': 'The type of document to create when -input_file_type is documents, sequencefile or delimited_text. Accepted values: mixed (documents only), xml, json, text, binary. Default: mixed for documents, xml for sequencefile, and xml for delimited_text.',
        'options': [
          {
            'label': '',
            'value': null
          },
          {
            'label': 'mixed (documents only)',
            'value': 'mixed'
          },
          {
            'label': 'xml (default for sequence file)',
            'value': 'xml'
          },
          {
            'label': 'json',
            'value': 'json'
          },
          {
            'label': 'text',
            'value': 'text'
          },
          {
            'label': 'binary',
            'value': 'binary'
          }
        ],
        'value': 'xml'
      },
      {
        'label': 'Input File Pattern',
        'field': 'input_file_pattern',
        'type': 'string',
        'description': 'Load only input files that match this regular expression from the path(s) matched by -input_file_path. For details, see Regular Expression Syntax.\nDefault: Load all files. This option is ignored when -input_file_type is forest.'
      },
      {
        'label': 'Input Files are Compressed?',
        'field': 'input_compressed',
        'type': 'boolean',
        'description': 'Whether or not the source data is compressed.\nDefault: false.'
      },
      {
        'label': 'Input Compression Codec',
        'field': 'input_compression_codec',
        'type': 'type',
        'description': 'When -input_compressed is true, the code used for compression. Accepted values: zip, gzip.',
        'options': [
          {
            'label': '',
            'value': null
          },
          {
            'label': 'zip',
            'value': 'zip'
          },
          {
            'label': 'gzip',
            'value': 'gzip'
          }
        ],
        'filter': {
          'field': 'input_compressed',
          'value': 'true'
        }
      },
      {
        'label': 'Namespace',
        'field': 'namespace',
        'type': 'string',
        'description': 'The default namespace for all XML documents created during loading.'
      },
      {
        'label': 'XML Repair Level',
        'field': 'xml_repair_level',
        'type': 'string',
        'description': 'The degree of repair to attempt on XML documents in order to create well-formed XML. Accepted values: default,full, none.\nDefault: default, which depends on the configured MarkLogic Server default XQuery version: In XQuery 1.0 and 1.0-ml the default is none. In XQuery 0.9-ml the default is full.'
      },
      {
        'label': 'Fastload',
        'field': 'fastload',
        'type': 'boolean',
        'description': 'The -fastload option can significantly speed up ingestion during import and copy operations, but it can also cause problems if not used properly. When you use -fastload mlcp attempts to cut out the middle step by applying the document assignment policy on the client. Do NOT use -fastload to re-insert documents if the forest topology or assignment policy has changed since the document was originally inserted. Do NOT use -fastload if the forest topology or assignment policy will change as -fastload is running.'
      },
      {
        'label': 'Thread Count',
        'field': 'thread_count',
        'type': 'number',
        'description': 'The number of threads to spawn for concurrent loading. The total number of threads spawned by the process can be larger than this number, but this option caps the number of concurrent sessions with MarkLogic Server. Only available in local mode.\nDefault: 4.'
      },
      {
        'label': 'Batch Size',
        'field': 'batch_size',
        'type': 'number',
        'description': 'The number of documents to process in a single request to MarkLogic Server. This option is ignored when you use -transform_module; a transform always sets the batch size to 1.\nDefault: 100.'
      }
    ],
    'collapsed': true
  },
  {
    'category': 'Delimited Text Options',
    'caption': 'If the selected file ends in .csv, .xls, or .xlsx, the server will assume that the input file type is "delimited_text".',
    'settings': [
      {
        'label': 'Generate URI?',
        'field': 'generate_uri',
        'type': 'boolean',
        'description': 'Whether or not MarkLogic Server should automatically generate document URIs.\nDefault: false.'
      },
      {
        'label': 'Split Input?',
        'field': 'split_input',
        'type': 'boolean',
        'description': 'Whether or not to divide input data into logical chunks to support more concurrency. Only supported when -input_file_type is one of the following: delimited_text.\nDefault: false for local mode, true for distributed mode. For details, see Improving Throughput with -split_input.'
      },
      {
        'label': 'Delimiter',
        'field': 'delimiter',
        'type': 'character',
        'description': 'When importing content with -input_file_type delimited_text, the delimiting character.\nDefault: comma (,).'
      },
      {
        'label': 'URI ID',
        'field': 'uri_id',
        'type': 'string',
        'description': 'The column name that contributes to the id portion of the URI for inserted documents. Default: The first column.'
      },
      {
        'label': 'Delimited Root Name',
        'field': 'delimited_root_name',
        'type': 'string',
        'description': 'When importing content with -input_file_type delimited_text, the localname of the document root element.\nDefault: root.'
      },
      {
        'label': 'Data Type',
        'field': 'data_type',
        'type': 'comma-list',
        'description': 'When importing content with -input_file_type delimited_text and -document_type json, use this option to specify the data type (string, number, or boolean) to give to specific fields. The option value must be a comma separated list of name,datatype pairs, such as "a, number, b, boolean".\nDefault: All fields have string type. For details, see Controlling Data Type in JSON Output.'
      }
    ],
    'collapsed': true
  },
  {
    'category': 'Delimited Json Options',
    'caption': 'If the selected file ends in .csv, .xls, or .xlsx, the server will assume that the input file type is "delimited_text".',
    'settings': [
      {
        'label': 'Generate URI?',
        'field': 'generate_uri',
        'type': 'boolean',
        'description': 'Whether or not MarkLogic Server should automatically generate document URIs.\nDefault: false.'
      },
      {
        'label': 'URI ID',
        'field': 'uri_id',
        'type': 'string',
        'description': 'The element, attribute, or property name within the document to use as the document URI. Default: None; the URI is based on the file name, as described in Default Document URI Construction.'
      }
    ],
    'collapsed': true
  },
  {
    'category': 'Aggregate XML Options',
    'settings': [
      {
        'label': 'Aggregate Record Element',
        'field': 'aggregate_record_element',
        'type': 'string',
        'description': 'When splitting an aggregate input file into multiple documents, the name of the element to use as the output document root.\nDefault: The first child element under the root element.'
      },
      {
        'label': 'Aggregate Record Namespace',
        'field': 'aggregate_record_namespace',
        'type': 'string',
        'description': 'The namespace of the element specificed by -aggregate_record_element_name.\nDefault: No namespace.'
      },
      {
        'label': 'URI ID',
        'field': 'uri_id',
        'type': 'string',
        'description': 'The element, attribute, or property name within the document to use as the document URI. Default: None; the URI is based on the file name, as described in Default Document URI Construction.'
      }
    ],
    'collapsed': true
  },
  {
    'category': 'Transform Options',
    'settings': [
      {
        'label': 'Transform Module',
        'field': 'transform_module',
        'type': 'string',
        'description': 'The path in the modules database or modules directory of a custom content transformation function installed on MarkLogic Server. This option is required to enable a custom transformation. For details, see Transforming Content During Ingestion.',
        'value': '/data-hub/4/transforms/mlcp-flow-transform.xqy',
        'readOnly': true
      },
      {
        'label': 'Transform Namespace',
        'field': 'transform_namespace',
        'type': 'string',
        'description': 'The namespace URI of the custom content transformation function named by -transform_function. Ignored if-transform_module is not specified.\nDefault: no namespace. For details, see Transforming Content During Ingestion.',
        'value': 'http://marklogic.com/data-hub/mlcp-flow-transform',
        'readOnly': true
      },
      {
        'label': 'Transform Param',
        'field': 'transform_param',
        'type': 'string',
        'description': 'Optional extra data to pass through to a custom transformation function. Ignored if -transform_module is not specified.\nDefault: no namespace. For details, see Transforming Content During Ingestion.',
        'value': 'entity-name=Patients,flow-name=nppes',
        'readOnly': true
      }
    ],
    'collapsed': true
  }
];

const sampleFlow = {
  'useEsModel': true,
  'tabIndex': 0,
  'entityName': 'Patients',
  'flowName': 'nppes',
  'codeFormat': 'XQUERY',
  'dataFormat': 'XML',
  'plugins': [
    {
      'hasShown': false,
      'history': {
        'done': [],
        'undone': []
      },
      'pluginType': 'content',
      'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/input/nppes/content/content.xqy',
      'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace envelope = \'http://marklogic.com/data-hub/envelope\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Content Plugin\r\n :\r\n : @param $id          - the identifier returned by the collector\r\n : @param $raw-content - the raw content being loaded.\r\n : @param $options     - a map containing options. Options are sent from Java\r\n :\r\n : @return - your transformed content\r\n :)\r\ndeclare function plugin:create-content(\r\n  $id as xs:string,\r\n  $raw-content as node()?,\r\n  $options as map:map) as node()?\r\n{\r\n  $raw-content\r\n};\r\n',
      'codemirrorConfig': {
        'lineNumbers': true,
        'indentWithTabs': false,
        'indentUnit': 2,
        'tabSize': 2,
        'lineWrapping': true,
        'readOnly': false,
        'gutters': [
          'CodeMirror-linenumbers',
          'buglines'
        ],
        'mode': 'application/xquery'
      }
    },
    {
      'hasShown': false,
      'history': {
        'done': [],
        'undone': []
      },
      'pluginType': 'headers',
      'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/input/nppes/headers/headers.xqy',
      'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace envelope = \'http://marklogic.com/data-hub/envelope\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Headers Plugin\r\n :\r\n : @param $id      - the identifier returned by the collector\r\n : @param $content - the output of your content plugin\r\n : @param $options - a map containing options. Options are sent from Java\r\n :\r\n : @return - zero or more header nodes\r\n :)\r\ndeclare function plugin:create-headers(\r\n  $id as xs:string,\r\n  $content as node()?,\r\n  $options as map:map) as node()*\r\n{\r\n  ()\r\n};\r\n',
      'codemirrorConfig': {
        'lineNumbers': true,
        'indentWithTabs': false,
        'indentUnit': 2,
        'tabSize': 2,
        'lineWrapping': true,
        'readOnly': false,
        'gutters': [
          'CodeMirror-linenumbers',
          'buglines'
        ],
        'mode': 'application/xquery'
      }
    },
    {
      'hasShown': false,
      'history': {
        'done': [],
        'undone': []
      },
      'pluginType': 'main',
      'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/input/nppes/main.xqy',
      'fileContents': 'xquery version \'1.0-ml\';\r\n\r\n(: Your plugin must be in this namespace for the DHF to recognize it:)\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\n(:\r\n : This module exposes helper functions to make your life easier\r\n : See documentation at:\r\n : https://github.com/marklogic/marklogic-data-hub/wiki/dhf-lib\r\n :)\r\nimport module namespace dhf = \'http://marklogic.com/dhf\'\r\nat \'/data-hub/4/dhf.xqy\';\r\n\r\n(: include modules to construct various parts of the envelope :)\r\nimport module namespace content = \'http://marklogic.com/data-hub/plugins\' at \'content/content.xqy\';\r\nimport module namespace headers = \'http://marklogic.com/data-hub/plugins\' at \'headers/headers.xqy\';\r\nimport module namespace triples = \'http://marklogic.com/data-hub/plugins\' at \'triples/triples.xqy\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Plugin Entry point\r\n :\r\n : @param $id          - the identifier returned by the collector\r\n : @param $options     - a map containing options. Options are sent from Java\r\n :\r\n :)\r\ndeclare function plugin:main(\r\n  $id as xs:string,\r\n  $raw-content as node()?,\r\n  $options as map:map)\r\n{\r\n  let $content-context := dhf:content-context($raw-content)\r\n  let $content := dhf:run($content-context, function() {\r\n    content:create-content($id, $raw-content, $options)\r\n  })\r\n\r\n  let $header-context := dhf:headers-context($content)\r\n  let $headers := dhf:run($header-context, function() {\r\n    headers:create-headers($id, $content, $options)\r\n  })\r\n\r\n  let $triple-context := dhf:triples-context($content, $headers)\r\n  let $triples := dhf:run($triple-context, function() {\r\n    plugin:create-triples($id, $content, $headers, $options)\r\n  })\r\n\r\n  let $envelope := dhf:make-envelope($content, $headers, $triples, map:get($options, \'dataFormat\'))\r\n  (:\r\n   : log the final envelope as a trace\r\n   : only fires if tracing is enabled\r\n   :)\r\n  let $_ := dhf:log-trace(dhf:writer-context($envelope))\r\n  return\r\n    $envelope\r\n};\r\n',
      'codemirrorConfig': {
        'lineNumbers': true,
        'indentWithTabs': false,
        'indentUnit': 2,
        'tabSize': 2,
        'lineWrapping': true,
        'readOnly': false,
        'gutters': [
          'CodeMirror-linenumbers',
          'buglines'
        ],
        'mode': 'application/xquery'
      }
    },
    {
      'hasShown': false,
      'history': {
        'done': [],
        'undone': []
      },
      'pluginType': 'triples',
      'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/input/nppes/triples/triples.xqy',
      'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace envelope = \'http://marklogic.com/data-hub/envelope\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Triples Plugin\r\n :\r\n : @param $id      - the identifier returned by the collector\r\n : @param $content - the output of your content plugin\r\n : @param $headers - the output of your headers plugin\r\n : @param $options - a map containing options. Options are sent from Java\r\n :\r\n : @return - zero or more triples\r\n :)\r\ndeclare function plugin:create-triples(\r\n  $id as xs:string,\r\n  $content as node()?,\r\n  $headers as node()*,\r\n  $options as map:map) as sem:triple*\r\n{\r\n  ()\r\n};\r\n',
      'codemirrorConfig': {
        'lineNumbers': true,
        'indentWithTabs': false,
        'indentUnit': 2,
        'tabSize': 2,
        'lineWrapping': true,
        'readOnly': false,
        'gutters': [
          'CodeMirror-linenumbers',
          'buglines'
        ],
        'mode': 'application/xquery'
      }
    }
  ]
};
