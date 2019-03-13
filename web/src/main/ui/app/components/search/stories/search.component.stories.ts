import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {SearchUiComponent, ThemeModule} from "../..";
import {FacetsComponent} from '../../facets/facets.component';
import {PaginationComponent} from '../../pagination';
import {ClipboardDirective} from '../../../directives/clipboard';
import {ObjectToArrayPipe} from '../../../object-to-array.pipe';
import {TruncateCharactersPipe} from '../../../pipes/truncate';
import {DatePipePipe} from '../../../pipes/date-pipe/date-pipe.pipe';


storiesOf('Components|Search', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, HttpModule],
      schemas: [],
      declarations: [
        FacetsComponent,
        PaginationComponent,
        SearchUiComponent,
        StoryCardComponent,
        ClipboardDirective,
        ObjectToArrayPipe,
        TruncateCharactersPipe,
        DatePipePipe
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Search Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'1500px'" [height]="'1300px'">
              <app-search-ui      
                [databases]="databases"
                [currentDatabase]="currentDatabase"
                [entitiesOnly]="entitiesOnly"
                [searchText]="searchText"
                [loadingTraces]="loadingTraces"
                [searchResponse]="searchResponse"
                [activeFacets]="activeFacets"
                
                (doSearch)="doSearch()"
                (currentDatabaseChanged)="currentDatabaseChanged($event)"
                (entitiesOnlyChanged)="entitiesOnlyChanged($event)"
                (searchTextChanged)="searchTextChanged($event)"
                (pageChanged)="pageChanged($event)"
                (onActiveFacetsChange)="activeFacetsChange($event)"
                (uriCopied)="uriCopied()"
                (showDoc)="showDoc($event)"
              ></app-search-ui>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      databases: object('databases', ['STAGING', 'FINAL']),
      currentDatabase: text('currentDatabase', 'STAGING'),
      entitiesOnly: boolean('entitiesOnly', false),
      searchText: text('searchText', undefined),
      loadingTraces: boolean('loadingTraces', false),
      searchResponse: boolean('searchResponse', {
        'snippet-format': 'snippet',
        'total': 1450,
        'start': 1,
        'page-length': 10,
        'results': [{
          'index': 1,
          'uri': '800',
          'path': 'fn:doc(\'800\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=800&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'800\')/object-node()',
            'match-text': ['800 294 08/27/2017 09/04/2017 1000200 267154901716 19.99 1.0 19.99 gothic cuckoo Extension 2']
          }]
        }, {
          'index': 2,
          'uri': '801',
          'path': 'fn:doc(\'801\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=801&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'801\')/object-node()',
            'match-text': ['801 855 08/27/2017 08/30/2017 1000192 160410725471 24.95 3.0 20.67 left foxglove']
          }]
        }, {
          'index': 3,
          'uri': '802',
          'path': 'fn:doc(\'802\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=802&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'802\')/object-node()',
            'match-text': ['802 200 08/27/2017 09/07/2017 1000153 164451986229 4.5 1.0 4.31 unwilling eave']
          }]
        }, {
          'index': 4,
          'uri': '803',
          'path': 'fn:doc(\'803\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=803&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'803\')/object-node()',
            'match-text': ['803 29 08/27/2017 09/05/2017 1000168 370461789065 10.0 1.0 7.0 planned casserole A shirt for planned casserole']
          }]
        }, {
          'index': 5,
          'uri': '804',
          'path': 'fn:doc(\'804\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=804&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'804\')/object-node()',
            'match-text': ['804 380 08/28/2017 09/02/2017 1000111 132362551004 10.0 2.0 7.86 alert doubling']
          }]
        }, {
          'index': 6,
          'uri': '805',
          'path': 'fn:doc(\'805\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=805&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'805\')/object-node()',
            'match-text': ['805 75 08/28/2017 09/02/2017 1000109 115153344249 8.99 1.0 8.22 white blade']
          }]
        }, {
          'index': 7,
          'uri': '806',
          'path': 'fn:doc(\'806\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=806&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'806\')/object-node()',
            'match-text': ['806 422 08/29/2017 09/07/2017 1000072 101166955093 33.99 1.0 23.79 weird air']
          }]
        }, {
          'index': 8,
          'uri': '807',
          'path': 'fn:doc(\'807\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=807&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'807\')/object-node()',
            'match-text': ['807 865 08/29/2017 09/09/2017 1000171 187071644897 35.0 1.0 26.0 olympic jot']
          }]
        }, {
          'index': 9,
          'uri': '808',
          'path': 'fn:doc(\'808\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=808&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'808\')/object-node()',
            'match-text': ['808 675 08/29/2017 09/07/2017 1000216 436023930700 10.0 1.0 9.57 soft bike Replacement card deck']
          }]
        }, {
          'index': 10,
          'uri': '809',
          'path': 'fn:doc(\'809\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=809&database=data-hub-STAGING',
          'mimetype': 'application/json',
          'format': 'json',
          'matches': [{
            'path': 'fn:doc(\'809\')/object-node()',
            'match-text': ['809 117 08/29/2017 09/05/2017 1000193 123206535388 33.99 1.0 32.53 high brassiere']
          }]
        }],
        'facets': {
          'Collection': {
            'type': 'collection',
            'facetValues': [{'name': 'LoadOrders', 'count': 1000, 'value': 'LoadOrders'}, {
              'name': 'LoadProducts',
              'count': 450,
              'value': 'LoadProducts'
            }, {'name': 'Order', 'count': 1000, 'value': 'Order'}, {
              'name': 'Product',
              'count': 450,
              'value': 'Product'
            }, {'name': 'input', 'count': 1450, 'value': 'input'}]
          }
        },
        'metrics': {
          'query-resolution-time': 'PT0.002142S',
          'facet-resolution-time': 'PT0.000474S',
          'snippet-resolution-time': 'PT0.001919S',
          'total-time': 'PT0.481816S'
        }
      }),
      activeFacets: object('activeFacets', {'Collection': {'values': ['input']}}),
      doSearch: action('Search triggered'),
      currentDatabaseChanged: action('Current Database Changed'),
      entitiesOnlyChanged: action('Entities Only Changed'),
      searchTextChanged: action('Search Text Changed'),
      pageChanged: action('Page Changed'),
      onActiveFacetsChange: action('Active Facets Change'),
      uriCopied: action('Uri Copied'),
      showDoc: action('Show Doc')
    }
  }));
