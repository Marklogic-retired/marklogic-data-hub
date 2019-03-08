import {HttpModule} from '@angular/http';
import {MdlModule} from '@angular-mdl/core';
import {CommonModule} from '@angular/common';
import {action} from '@storybook/addon-actions';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {RouterTestingModule} from '@angular/router/testing';
import {TooltipModule} from 'ngx-bootstrap';

import {ClipboardDirective} from '../../../directives/clipboard';
import {CodemirrorComponent} from "../../codemirror";
import {FolderBrowserComponent} from '../../folder-browser';
import {HarmonizeFlowOptionsComponent} from '../../harmonize-flow-options';
import {HarmonizeFlowOptionsUiComponent} from '../../harmonize-flow-options/ui';
import {MlcpComponent} from '../../mlcp';
import {MlcpUiComponent} from '../../mlcp/ui';
import {ObjectToArrayPipe} from '../../../object-to-array.pipe';
import {TruncateCharactersPipe} from '../../../pipes/truncate';
import {FlowsUiComponent} from '../ui';
import {GridManiaModule} from '../../grid';
import {SelectComponent, ThemeModule} from '../..';
import {StoryCardComponent} from '../../../utils';
import {SelectKeyValuesComponent} from '../../select-key-values';
import {FolderBrowserUiComponent} from '../../folder-browser/ui';
import {EntitiesService} from '../../../models/entities.service';
import {ProjectService} from '../../../services/projects';
import {SettingsService} from '../../settings';
import {EnvironmentService} from '../../../services/environment';


storiesOf('Components|Flows', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule,
        GridManiaModule,
        MdlModule,
        CommonModule,
        RouterTestingModule,
        HttpModule,
        TooltipModule.forRoot()
      ],
      declarations: [
        FlowsUiComponent,
        StoryCardComponent,
        ObjectToArrayPipe,
        TruncateCharactersPipe,
        MlcpComponent,
        MlcpUiComponent,
        HarmonizeFlowOptionsComponent,
        HarmonizeFlowOptionsUiComponent,
        CodemirrorComponent,
        FolderBrowserComponent,
        SelectComponent,
        ClipboardDirective,
        SelectKeyValuesComponent,
        FolderBrowserUiComponent
      ],
      providers: [
        EntitiesService,
        ProjectService,
        SettingsService,
        EnvironmentService
      ]
    })
  )
  .add('Flows Component', () => ({
    template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="'1500px'" [height]="'1500px'">
                    <app-flows-ui
                        [hasErrors] = "hasErrorsInput"
                        [markLogicVersion] = "markLogicVersionInput"
                        [lastDeployed] = "lastDeployedInput"
                        [entities] = "entities"
                        [entity] = "entity"
                        [errors] = "errorsInput"
                        [flowType] = "flowType"
                        [flow] = "flow"
                        [mlcpOptions] = "mlcpOptions"
                        (deleteFlowClicked) = "deleteFlow($event)"
                        (showNewFlowClicked) = "showNewFlow($event)"
                        (redeployClicked) = "redeployModules()"
                        (runImportClicked) = "runInputFlow($event)"
                        (runHarmonizeClicked) = "runHarmonizeFlow($event)"
                        (savePluginClicked) = "savePlugin($event)"
                    >
                    </app-flows-ui>
                </mlui-story-card>
            </mlui-dhf-theme>
        `,
    props: {
      hasErrorsInput: boolean('hasError', false),
      markLogicVersionInput: text('MLVersion', '9.0-20181023'),
      lastDeployed: text('lastDeployed', 'about 13 hours ago'),
      entities: object('entities', SampleEntities),
      entity: object('entity', SampleEntities[0]),
      errors: object('errors', undefined),
      flowType: text('flowType', 'INPUT'),
      flow: object('flow', SampleEntities[0].inputFlows[0]),
      mlcpOptions: object('mlcpOptions', SampleMlcpOptions),
      deleteFlow: action('deleteFlowClicked'),
      showNewFlow: action('showNewFlowClicked'),
      redeployModules: action('redeployClicked'),
      runInputFlow: action('runImportClicked'),
      runHarmonizeFlow: action('runHarmonizeClicked'),
      savePlugin: action('savePluginClicked')
    },
  }));

const SampleMlcpOptions = {
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

const SampleEntities = [
  {
    '_scale': 1,
    'editDescription': false,
    'editBaseUri': false,
    'editing': false,
    'hasDocs': false,
    'dragging': false,
    'transform': 'translate(210, 158) scale(1)',
    'filename': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/Patients.entity.json',
    'hubUi': {
      'vertices': {},
      'x': 210,
      'y': 158,
      'width': 532,
      'height': 231
    },
    'info': {
      'title': 'Patients',
      'version': '0.0.1',
      'baseUri': null,
      'description': null
    },
    'definition': {
      'description': null,
      'primaryKey': null,
      'required': [],
      'elementRangeIndex': [],
      'rangeIndex': [],
      'wordLexicon': [],
      'pii': [],
      'properties': []
    },
    'inputFlows': [
      {
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
            'fileContents': 'xquery version \'1.0-ml\';\n\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\n\ndeclare namespace envelope = \'http://marklogic.com/data-hub/envelope\';\n\ndeclare option xdmp:mapping \'false\';\n\n(:~\n : Create Content Plugin\n : s\n : @param $id          - the identifier returned by the collector\n : @param $raw-content - the raw content being loaded.\n : @param $options     - a map containing options. Options are sent from Java\n :\n : @return - your transformed content\n :)\ndeclare function plugin:create-content(\n  $id as xs:string,\n  $raw-content as node()?,\n  $options as map:map) as node()?\n{\n  $raw-content\n};\n',
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
            'fileContents': 'xquery version \'1.0-ml\';\n\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\n\ndeclare namespace envelope = \'http://marklogic.com/data-hub/envelope\';\n\ndeclare option xdmp:mapping \'false\';\n\n(:~\n : Create Headers Plugin\n : s\n : @param $id      - the identifier returned by the collector\n : @param $content - the output of your content plugin\n : @param $options - a map containing options. Options are sent from Java\n :\n : @return - zero or more header nodes\n :)\ndeclare function plugin:create-headers(\n  $id as xs:string,\n  $content as node()?,\n  $options as map:map) as node()*\n{\n  ()\n};\n',
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
      },
      {
        'useEsModel': true,
        'tabIndex': 0,
        'entityName': 'Patients',
        'flowName': 'hl7',
        'codeFormat': 'XQUERY',
        'dataFormat': 'XML',
        'transformModulePath': () => action('cancel/close clicked'),
        'plugins': [
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'content',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/input/hl7/content/content.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace envelope = \'http://marklogic.com/data-hub/envelope\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Content Plugin\r\n :\r\n : @param $id          - the identifier returned by the collector\r\n : @param $raw-content - the raw content being loaded.\r\n : @param $options     - a map containing options. Options are sent from Java\r\n :\r\n : @return - your transformed content\r\n :)\r\ndeclare function plugin:create-content(\r\n  $id as xs:string,\r\n  $raw-content as node()?,\r\n  $options as map:map) as node()?\r\n{\r\n  $raw-content\r\n};\r\n'
          },
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'headers',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/input/hl7/headers/headers.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace envelope = \'http://marklogic.com/data-hub/envelope\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Headers Plugin\r\n :\r\n : @param $id      - the identifier returned by the collector\r\n : @param $content - the output of your content plugin\r\n : @param $options - a map containing options. Options are sent from Java\r\n :\r\n : @return - zero or more header nodes\r\n :)\r\ndeclare function plugin:create-headers(\r\n  $id as xs:string,\r\n  $content as node()?,\r\n  $options as map:map) as node()*\r\n{\r\n  ()\r\n};\r\n'
          },
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'main',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/input/hl7/main.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\n(: Your plugin must be in this namespace for the DHF to recognize it:)\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\n(:\r\n : This module exposes helper functions to make your life easier\r\n : See documentation at:\r\n : https://github.com/marklogic/marklogic-data-hub/wiki/dhf-lib\r\n :)\r\nimport module namespace dhf = \'http://marklogic.com/dhf\'\r\nat \'/data-hub/4/dhf.xqy\';\r\n\r\n(: include modules to construct various parts of the envelope :)\r\nimport module namespace content = \'http://marklogic.com/data-hub/plugins\' at \'content/content.xqy\';\r\nimport module namespace headers = \'http://marklogic.com/data-hub/plugins\' at \'headers/headers.xqy\';\r\nimport module namespace triples = \'http://marklogic.com/data-hub/plugins\' at \'triples/triples.xqy\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Plugin Entry point\r\n :\r\n : @param $id          - the identifier returned by the collector\r\n : @param $options     - a map containing options. Options are sent from Java\r\n :\r\n :)\r\ndeclare function plugin:main(\r\n  $id as xs:string,\r\n  $raw-content as node()?,\r\n  $options as map:map)\r\n{\r\n  let $content-context := dhf:content-context($raw-content)\r\n  let $content := dhf:run($content-context, function() {\r\n    content:create-content($id, $raw-content, $options)\r\n  })\r\n\r\n  let $header-context := dhf:headers-context($content)\r\n  let $headers := dhf:run($header-context, function() {\r\n    headers:create-headers($id, $content, $options)\r\n  })\r\n\r\n  let $triple-context := dhf:triples-context($content, $headers)\r\n  let $triples := dhf:run($triple-context, function() {\r\n    plugin:create-triples($id, $content, $headers, $options)\r\n  })\r\n\r\n  let $envelope := dhf:make-envelope($content, $headers, $triples, map:get($options, \'dataFormat\'))\r\n  (:\r\n   : log the final envelope as a trace\r\n   : only fires if tracing is enabled\r\n   :)\r\n  let $_ := dhf:log-trace(dhf:writer-context($envelope))\r\n  return\r\n    $envelope\r\n};\r\n'
          },
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'triples',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/input/hl7/triples/triples.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace envelope = \'http://marklogic.com/data-hub/envelope\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Triples Plugin\r\n :\r\n : @param $id      - the identifier returned by the collector\r\n : @param $content - the output of your content plugin\r\n : @param $headers - the output of your headers plugin\r\n : @param $options - a map containing options. Options are sent from Java\r\n :\r\n : @return - zero or more triples\r\n :)\r\ndeclare function plugin:create-triples(\r\n  $id as xs:string,\r\n  $content as node()?,\r\n  $headers as node()*,\r\n  $options as map:map) as sem:triple*\r\n{\r\n  ()\r\n};\r\n'
          }
        ]
      }
    ],
    'harmonizeFlows': [
      {
        'useEsModel': true,
        'tabIndex': 0,
        'entityName': 'Patients',
        'flowName': 'final',
        'codeFormat': 'XQUERY',
        'dataFormat': 'XML',
        'plugins': [
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'collector',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/final/collector/collector.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Collect IDs plugin\r\n :\r\n : @param $options - a map containing options. Options are sent from Java\r\n :\r\n : @return - a sequence of ids or uris\r\n :)\r\ndeclare function plugin:collect(\r\n  $options as map:map) as xs:string*\r\n{\r\n  cts:uris((), (), cts:collection-query(\'hl7\'))\r\n};\r\n\r\n'
          },
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'content',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/final/content/content.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace es = \'http://marklogic.com/entity-services\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Content Plugin\r\n :\r\n : @param $id          - the identifier returned by the collector\r\n : @param $options     - a map containing options. Options are sent from Java\r\n :\r\n : @return - your transformed content\r\n :)\r\ndeclare function plugin:create-content(\r\n  $id as xs:string,\r\n  $options as map:map) as node()?\r\n{\r\n  let $doc := fn:doc($id)\r\n  return\r\n    if ($doc/es:envelope) then\r\n      $doc/es:envelope/es:instance/node()\r\n    else if ($doc/envelope/instance) then\r\n      $doc/envelope/instance\r\n    else\r\n      $doc\r\n};\r\n'
          },
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'headers',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/final/headers/headers.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace es = \'http://marklogic.com/entity-services\';\r\n\r\ndeclare namespace hl7 = \'urn:hl7-org:v3\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Headers Plugin\r\n :\r\n : @param $id      - the identifier returned by the collector\r\n : @param $content - the output of your content plugin\r\n : @param $options - a map containing options. Options are sent from Java\r\n :\r\n : @return - zero or more header nodes\r\n :)\r\ndeclare function plugin:create-headers(\r\n  $id as xs:string,\r\n  $content as item()?,\r\n  $options as map:map) as node()*\r\n{\r\n  (\r\n    <original-hl7>{$id}</original-hl7>,\r\n    <patient-ssn>{$content/hl7:recordTarget/hl7:patientRole/hl7:id/@extension/fn:data()}</patient-ssn>,\r\n    <patient-gender>\r\n    {\r\n      let $gender-code as xs:string? := $content/hl7:recordTarget/hl7:patientRole/hl7:patient/hl7:administrativeGenderCode/@code\r\n      return\r\n        if ($gender-code = \'F\') then \'female\'\r\n        else if ($gender-code = \'M\') then \'male\'\r\n        else \'unknown\'\r\n    }\r\n    </patient-gender>,\r\n    <birth-date>\r\n    {\r\n      let $bd as xs:string? := $content/hl7:recordTarget/hl7:patientRole/hl7:patient/hl7:birthTime/@value\r\n      return\r\n        if ($bd) then\r\n          xs:date(fn:replace($bd, \'(\\d\\d\\d\\d)(\\d\\d)(\\d\\d)\', \'$1-$2-$3\'))\r\n        else ()\r\n    }\r\n    </birth-date>,\r\n    <race>{$content/hl7:recordTarget/hl7:patientRole/hl7:patient/hl7:raceCode/@displayName/fn:data()}</race>,\r\n\r\n    <providers>\r\n    {\r\n      for $npi as xs:string in $content//hl7:id[@root=\'2.16.840.1.113883.4.6\']/@extension\r\n      let $provider := fn:collection(\'nppes\')/es:envelope/es:content/root[NPI = $npi]\r\n      return\r\n        <provider>\r\n          <npi>{$npi}</npi>\r\n          <provider-name>\r\n          {\r\n            fn:string-join((\r\n              $provider/Provider_First_Name,\r\n              $provider/Provider_Last_Name__Legal_Name_\r\n            ), \' \')\r\n          }\r\n          </provider-name>\r\n        </provider>\r\n    }\r\n    </providers>\r\n  )\r\n};\r\n'
          },
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'main',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/final/main.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\n(: Your plugin must be in this namespace for the DHF to recognize it:)\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\n(:\r\n : This module exposes helper functions to make your life easier\r\n : See documentation at:\r\n : https://github.com/marklogic/marklogic-data-hub/wiki/dhf-lib\r\n :)\r\nimport module namespace dhf = \'http://marklogic.com/dhf\'\r\nat \'/data-hub/4/dhf.xqy\';\r\n\r\n(: include modules to construct various parts of the envelope :)\r\nimport module namespace content = \'http://marklogic.com/data-hub/plugins\' at \'content/content.xqy\';\r\nimport module namespace headers = \'http://marklogic.com/data-hub/plugins\' at \'headers/headers.xqy\';\r\nimport module namespace triples = \'http://marklogic.com/data-hub/plugins\' at \'triples/triples.xqy\';\r\n\r\n(: include the writer module which persists your envelope into MarkLogic :)\r\nimport module namespace writer = \'http://marklogic.com/data-hub/plugins\' at \'writer/writer.xqy\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Plugin Entry point\r\n :\r\n : @param $id          - the identifier returned by the collector\r\n : @param $options     - a map containing options. Options are sent from Java\r\n :\r\n :)\r\ndeclare function plugin:main(\r\n  $id as xs:string,\r\n  $options as map:map)\r\n{\r\n  let $content-context := dhf:content-context()\r\n  let $content := dhf:run($content-context, function() {\r\n    content:create-content($id, $options)\r\n  })\r\n\r\n  let $header-context := dhf:headers-context($content)\r\n  let $headers := dhf:run($header-context, function() {\r\n    headers:create-headers($id, $content, $options)\r\n  })\r\n\r\n  let $triple-context := dhf:triples-context($content, $headers)\r\n  let $triples := dhf:run($triple-context, function() {\r\n    triples:create-triples($id, $content, $headers, $options)\r\n  })\r\n\r\n  let $envelope := dhf:make-envelope($content, $headers, $triples, map:get($options, \'dataFormat\'))\r\n  return\r\n  (: writers must be invoked this way.\r\n     see: https://github.com/marklogic/marklogic-data-hub/wiki/dhf-lib#run-writer :)\r\n    dhf:run-writer(xdmp:function(xs:QName(\'writer:write\')), $id, $envelope, $options)\r\n};\r\n'
          },
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'triples',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/final/triples/triples.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\r\n\r\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\r\n\r\ndeclare namespace es = \'http://marklogic.com/entity-services\';\r\n\r\ndeclare option xdmp:mapping \'false\';\r\n\r\n(:~\r\n : Create Triples Plugin\r\n :\r\n : @param $id      - the identifier returned by the collector\r\n : @param $content - the output of your content plugin\r\n : @param $headers - the output of your headers plugin\r\n : @param $options - a map containing options. Options are sent from Java\r\n :\r\n : @return - zero or more triples\r\n :)\r\ndeclare function plugin:create-triples(\r\n  $id as xs:string,\r\n  $content as item()?,\r\n  $headers as item()*,\r\n  $options as map:map) as sem:triple*\r\n{\r\n  ()\r\n};\r\n'
          },
          {
            'hasShown': false,
            'history': {
              'done': [],
              'undone': []
            },
            'pluginType': 'writer',
            'pluginPath': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/final/writer/writer.xqy',
            'fileContents': 'xquery version \'1.0-ml\';\n\nmodule namespace plugin = \'http://marklogic.com/data-hub/plugins\';\n\ndeclare option xdmp:mapping \'false\';\n\n(:~\n : Writer Plugin\n : s\n : @param $id       - the identifier returned by the collector\n : @param $envelope - the final envelope\n : @param $options  - a map containing options. Options are sent from Java\n :\n : @return - nothing\n :)\ndeclare function plugin:write(\n  $id as xs:string,\n  $envelope as node(),\n  $options as map:map) as empty-sequence()\n{\n  xdmp:document-insert($id, $envelope, xdmp:default-permissions(), map:get($options, \'entity\'))\n};\n'
          }
        ]
      }
    ]
  }
];
