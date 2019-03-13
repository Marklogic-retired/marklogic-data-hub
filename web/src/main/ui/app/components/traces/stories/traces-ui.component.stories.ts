import {action} from '@storybook/addon-actions';
import {centered} from '@storybook/addon-centered/angular';
import {object, text, withKnobs} from '@storybook/addon-knobs';
import {moduleMetadata, storiesOf} from '@storybook/angular';

import {DatePipePipe} from '../../../pipes/date-pipe/date-pipe.pipe';
import {ObjectToArrayPipe} from '../../../object-to-array.pipe';
import {TruncateCharactersPipe} from '../../../pipes/truncate';
import {PaginationComponent} from '../../pagination';
import {SelectComponent, ThemeModule} from '../..';
import {TracesUiComponent} from '../ui';
import {StoryCardComponent} from '../../../utils';
import {FacetsComponent} from '../../facets/facets.component';

storiesOf('Components|Traces', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [
        ObjectToArrayPipe,
        FacetsComponent,
        PaginationComponent,
        SelectComponent,
        StoryCardComponent,
        TracesUiComponent,
        TruncateCharactersPipe,
        DatePipePipe
      ]
    })
  )
  .add('Traces Component', () => ({
    template: `
            <mlui-dhf-theme>
                <mlui-story-card width="1500px" height="1000px">
                    <app-traces-ui
                        [searchResponse]="searchResponse"
                        [traces]="traces"
                        [activeFacets]="activeFacets"
                        [searchText]="searchText"
                        (searchClicked)="searchClicked($event)"
                        (activeFacetsChange)="activeFacetsChange($event)"
                        (traceItemClicked)="traceItemClicked($event)"
                        (pageChanged)="pageChanged($event)"
                    >
                    </app-traces-ui>
                </mlui-story-card>
            </mlui-dhf-theme>
        `,
    props: {
      searchResponse: object('searchResponse', sampleSearchResponse),
      traces: object('traces', sampleTraces),
      activeFacets: object('activeFacets', {}),
      searchText: text('searchText', ''),
      searchClicked: action('searchClicked'),
      activeFacetsChange: action('activeFacetsChange'),
      traceItemClicked: action('traceItemClicked'),
      pageChanged: action('pageChanged')
    },
  }));

const sampleTraces = [
  {
    'traceId': '85776806680058643',
    'jobId': '78bcdc7d-a581-4361-9a21-58fe5e1a9b0a',
    'created': '2018-11-09T11:43:11.054991-08:00',
    'hasError': false,
    'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/REST/services/metadata/providers.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '5390606333960419842',
    'jobId': '78bcdc7d-a581-4361-9a21-58fe5e1a9b0a',
    'created': '2018-11-09T11:43:10.972349-08:00',
    'hasError': false,
    'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src/main/entity-config/final-entity-options.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '86712301774494572',
    'jobId': '78bcdc7d-a581-4361-9a21-58fe5e1a9b0a',
    'created': '2018-11-09T11:43:10.697552-08:00',
    'hasError': false,
    'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input/hl7/000-00-0000.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '15541414236986667150',
    'jobId': '78bcdc7d-a581-4361-9a21-58fe5e1a9b0a',
    'created': '2018-11-09T11:43:10.647593-08:00',
    'hasError': false,
    'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src/main/entity-config/staging-entity-options.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '5704352934787409188',
    'jobId': '61e5123c-33b9-47d4-8d01-66d2076e3d88',
    'created': '2018-11-09T11:42:19.636564-08:00',
    'hasError': false,
    'identifier': '/hl7/000-00-0000.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '10391911918367228025',
    'jobId': 'e0375110-e131-4bcf-bf1a-85c15cd11b06',
    'created': '2018-11-09T11:41:18.193737-08:00',
    'hasError': false,
    'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src/main/entity-config/final-entity-options.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '8090863649186997842',
    'jobId': 'e0375110-e131-4bcf-bf1a-85c15cd11b06',
    'created': '2018-11-09T11:41:17.884261-08:00',
    'hasError': false,
    'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/REST/services/metadata/providers.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '13103163378191617180',
    'jobId': 'e0375110-e131-4bcf-bf1a-85c15cd11b06',
    'created': '2018-11-09T11:41:17.669814-08:00',
    'hasError': false,
    'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input/hl7/000-00-0000.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '3199962468323849635',
    'jobId': 'e0375110-e131-4bcf-bf1a-85c15cd11b06',
    'created': '2018-11-09T11:41:17.630608-08:00',
    'hasError': false,
    'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src/main/entity-config/staging-entity-options.xml',
    'flowType': 'input',
    'format': 'xml'
  },
  {
    'traceId': '13193386352949384450',
    'jobId': '0f771923-1d14-4374-983a-1b20fbebdf83',
    'created': '2018-11-09T11:40:34.899312-08:00',
    'hasError': false,
    'identifier': '/hl7/000-00-0000.xml',
    'flowType': 'input',
    'format': 'xml'
  }
];


const sampleSearchResponse = {
  'snippet-format': 'raw',
  'total': 12,
  'start': 1,
  'page-length': 10,
  'results': [
    {
      'index': 1,
      'uri': '/85776806680058643.xml',
      'path': 'fn:doc(\'/85776806680058643.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F85776806680058643.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '85776806680058643',
        'jobId': '78bcdc7d-a581-4361-9a21-58fe5e1a9b0a',
        'created': '2018-11-09T11:43:11.054991-08:00',
        'hasError': false,
        'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/REST/services/metadata/providers.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 2,
      'uri': '/5390606333960419842.xml',
      'path': 'fn:doc(\'/5390606333960419842.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F5390606333960419842.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '5390606333960419842',
        'jobId': '78bcdc7d-a581-4361-9a21-58fe5e1a9b0a',
        'created': '2018-11-09T11:43:10.972349-08:00',
        'hasError': false,
        'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src/main/entity-config/final-entity-options.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 3,
      'uri': '/86712301774494572.xml',
      'path': 'fn:doc(\'/86712301774494572.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F86712301774494572.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '86712301774494572',
        'jobId': '78bcdc7d-a581-4361-9a21-58fe5e1a9b0a',
        'created': '2018-11-09T11:43:10.697552-08:00',
        'hasError': false,
        'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input/hl7/000-00-0000.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 4,
      'uri': '/15541414236986667150.xml',
      'path': 'fn:doc(\'/15541414236986667150.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F15541414236986667150.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '15541414236986667150',
        'jobId': '78bcdc7d-a581-4361-9a21-58fe5e1a9b0a',
        'created': '2018-11-09T11:43:10.647593-08:00',
        'hasError': false,
        'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src/main/entity-config/staging-entity-options.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 5,
      'uri': '/5704352934787409188.xml',
      'path': 'fn:doc(\'/5704352934787409188.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F5704352934787409188.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '5704352934787409188',
        'jobId': '61e5123c-33b9-47d4-8d01-66d2076e3d88',
        'created': '2018-11-09T11:42:19.636564-08:00',
        'hasError': false,
        'identifier': '/hl7/000-00-0000.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 6,
      'uri': '/10391911918367228025.xml',
      'path': 'fn:doc(\'/10391911918367228025.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F10391911918367228025.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '10391911918367228025',
        'jobId': 'e0375110-e131-4bcf-bf1a-85c15cd11b06',
        'created': '2018-11-09T11:41:18.193737-08:00',
        'hasError': false,
        'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src/main/entity-config/final-entity-options.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 7,
      'uri': '/8090863649186997842.xml',
      'path': 'fn:doc(\'/8090863649186997842.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F8090863649186997842.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '8090863649186997842',
        'jobId': 'e0375110-e131-4bcf-bf1a-85c15cd11b06',
        'created': '2018-11-09T11:41:17.884261-08:00',
        'hasError': false,
        'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/plugins/entities/Patients/harmonize/REST/services/metadata/providers.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 8,
      'uri': '/13103163378191617180.xml',
      'path': 'fn:doc(\'/13103163378191617180.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F13103163378191617180.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '13103163378191617180',
        'jobId': 'e0375110-e131-4bcf-bf1a-85c15cd11b06',
        'created': '2018-11-09T11:41:17.669814-08:00',
        'hasError': false,
        'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/input/hl7/000-00-0000.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 9,
      'uri': '/3199962468323849635.xml',
      'path': 'fn:doc(\'/3199962468323849635.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F3199962468323849635.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '3199962468323849635',
        'jobId': 'e0375110-e131-4bcf-bf1a-85c15cd11b06',
        'created': '2018-11-09T11:41:17.630608-08:00',
        'hasError': false,
        'identifier': '/Users/pzhou/Documents/Projects/marklogic-data-hub/examples/healthcare/src/main/entity-config/staging-entity-options.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    },
    {
      'index': 10,
      'uri': '/13193386352949384450.xml',
      'path': 'fn:doc(\'/13193386352949384450.xml\')',
      'score': 0,
      'confidence': 0,
      'fitness': 0,
      'href': '/v1/documents?uri=%2F13193386352949384450.xml&database=data-hub-JOBS',
      'mimetype': 'application/xml',
      'format': 'xml',
      'content': {
        'traceId': '13193386352949384450',
        'jobId': '0f771923-1d14-4374-983a-1b20fbebdf83',
        'created': '2018-11-09T11:40:34.899312-08:00',
        'hasError': false,
        'identifier': '/hl7/000-00-0000.xml',
        'flowType': 'input',
        'format': 'xml'
      }
    }
  ],
  'facets': {
    'flowType': {
      'type': 'xs:string',
      'facetValues': [
        {
          'name': 'harmonize',
          'count': 1,
          'value': 'harmonize'
        },
        {
          'name': 'input',
          'count': 11,
          'value': 'input'
        }
      ]
    },
    'hasError': {
      'type': 'xs:string',
      'facetValues': [
        {
          'name': 'false',
          'count': 12,
          'value': 'false'
        }
      ]
    }
  },
  'metrics': {
    'query-resolution-time': 'PT0.008398S',
    'facet-resolution-time': 'PT0.009952S',
    'snippet-resolution-time': 'PT0.000305S',
    'total-time': 'PT0.374968S'
  },
  'pageLength': 10
};
