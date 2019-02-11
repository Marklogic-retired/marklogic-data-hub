import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {JobsUiComponent, ThemeModule} from "../..";
import {FacetsComponent} from '../../facets/facets.component';
import {PaginationComponent} from '../../pagination';
import {ObjectToArrayPipe} from '../../../object-to-array.pipe';
import {TruncateCharactersPipe} from '../../../pipes/truncate';
import {DatePipePipe} from '../../../pipes/date-pipe/date-pipe.pipe';


storiesOf('Components|Jobs', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, HttpModule],
      schemas: [],
      declarations: [
        FacetsComponent,
        PaginationComponent,
        JobsUiComponent,
        StoryCardComponent,
        ObjectToArrayPipe,
        TruncateCharactersPipe,
        DatePipePipe
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Jobs Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'1500px'" [height]="'768px'">
              <app-jobs-ui      
                [loadingJobs]="loadingJobs"
                [searchText]="searchText"
                [searchResponse]="searchResponse"
                [activeFacets]="activeFacets"
                [jobs]="jobs"
                [selectedJobs]="selectedJobs"
                (getDuration)="getDuration($event)"
                (getIconClass)="getIconClass($event)"
                (hasLiveOutput)="hasLiveOutput($event)"
                (searchClicked)="doSearch()"
                (exportJobsClicked)="exportJobs()"
                (deleteJobsClicked)="deleteJobs()"
                (pageChanged)="pageChanged($event)"
                (activeFacetsChange)="updateFacets($event)"      
                (searchTextChanged)="searchTextChanged($event)"   
                (showConsoleClicked)="showConsole($event)"   
                (showTracesClicked)="showTraces($event)"
                (toggleSelectJobClicked)="toggleSelectJob($event)"
              ></app-jobs-ui>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      loadingJobs: boolean('loadingJobs', false),
      searchText: text('searchText', ''), // undefined
      searchResponse: object('searchResponse', {
        'snippet-format': 'raw',
        'total': 5,
        'start': 1,
        'page-length': 10,
        'results': [{
          'index': 1,
          'uri': '/jobs/c751d0fc-12f5-4848-80ce-b842f06de547.json',
          'path': 'fn:doc(\'/jobs/c751d0fc-12f5-4848-80ce-b842f06de547.json\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=%2Fjobs%2Fc751d0fc-12f5-4848-80ce-b842f06de547.json&database=data-hub-JOBS',
          'mimetype': 'application/json',
          'format': 'json',
          'content': {
            'jobId': 'c751d0fc-12f5-4848-80ce-b842f06de547',
            'flowType': 'input',
            'flowName': 'Load Orders',
            'entityName': 'Order',
            'jobName': null,
            'startTime': '2018-10-30T00:25:54.940Z',
            'endTime': '2018-10-30T00:25:55.443Z',
            'jobOutput': ['java.lang.IllegalArgumentException: The setting for document_typeis not applicable to DELIMITED_TEXT\n\tat com.marklogic.contentpump.Command$1.applyConfigOptions(Command.java:457)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:348)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)'],
            'status': 'FAILED',
            'successfulEvents': 0,
            'failedEvents': 0,
            'successfulBatches': 0,
            'failedBatches': 0,
            'duration': 0,
            'iconClass': 'mdi-import',
            'hasLiveOutput': false
          }
        }, {
          'index': 2,
          'uri': '/jobs/8292ae80-d862-4657-bb66-c4e35fca33ec.json',
          'path': 'fn:doc(\'/jobs/8292ae80-d862-4657-bb66-c4e35fca33ec.json\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=%2Fjobs%2F8292ae80-d862-4657-bb66-c4e35fca33ec.json&database=data-hub-JOBS',
          'mimetype': 'application/json',
          'format': 'json',
          'content': {
            'jobId': '8292ae80-d862-4657-bb66-c4e35fca33ec',
            'flowType': 'input',
            'flowName': 'Load Orders',
            'entityName': 'Order',
            'jobName': null,
            'startTime': '2018-10-30T00:25:16.926Z',
            'endTime': '2018-10-30T00:25:17.601Z',
            'jobOutput': ['Oct 29, 2018 5:25:17 PM com.marklogic.contentpump.LocalJobRunner applyConfigOptions\nINFO: Content type: JSON\nException in thread \'main\' java.lang.NoClassDefFoundError: org/apache/log4j/Level\n\tat org.apache.hadoop.mapred.JobConf.<clinit>(JobConf.java:357)\n\tat com.marklogic.contentpump.LocalJob.<init>(LocalJob.java:37)\n\tat com.marklogic.contentpump.LocalJob.getInstance(LocalJob.java:58)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:353)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)\nCaused by: java.lang.ClassNotFoundException: org.apache.log4j.Level\n\tat java.net.URLClassLoader.findClass(URLClassLoader.java:381)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:424)\n\tat sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:331)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:357)\n\t... 6 more'],
            'status': 'FAILED',
            'successfulEvents': 0,
            'failedEvents': 0,
            'successfulBatches': 0,
            'failedBatches': 0,
            'duration': 0,
            'iconClass': 'mdi-import',
            'hasLiveOutput': false
          }
        }, {
          'index': 3,
          'uri': '/jobs/66e543a6-99a4-498e-ace4-4e20cb944739.json',
          'path': 'fn:doc(\'/jobs/66e543a6-99a4-498e-ace4-4e20cb944739.json\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=%2Fjobs%2F66e543a6-99a4-498e-ace4-4e20cb944739.json&database=data-hub-JOBS',
          'mimetype': 'application/json',
          'format': 'json',
          'content': {
            'jobId': '66e543a6-99a4-498e-ace4-4e20cb944739',
            'flowType': 'input',
            'flowName': 'Load Orders',
            'entityName': 'Order',
            'jobName': null,
            'startTime': '2018-10-30T00:24:01.739Z',
            'endTime': '2018-10-30T00:24:02.392Z',
            'jobOutput': ['java.lang.IllegalArgumentException: Only one of generate_uri and uri_id can be specified\n\tat com.marklogic.contentpump.Command$1.applyUriId(Command.java:421)\n\tat com.marklogic.contentpump.Command$1.applyConfigOptions(Command.java:460)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:348)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)'],
            'status': 'FAILED',
            'successfulEvents': 0,
            'failedEvents': 0,
            'successfulBatches': 0,
            'failedBatches': 0,
            'duration': 0,
            'iconClass': 'mdi-import',
            'hasLiveOutput': false
          }
        }, {
          'index': 4,
          'uri': '/jobs/a7e9cf5f-4786-4739-b6c9-876b88cfc927.json',
          'path': 'fn:doc(\'/jobs/a7e9cf5f-4786-4739-b6c9-876b88cfc927.json\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=%2Fjobs%2Fa7e9cf5f-4786-4739-b6c9-876b88cfc927.json&database=data-hub-JOBS',
          'mimetype': 'application/json',
          'format': 'json',
          'content': {
            'jobId': 'a7e9cf5f-4786-4739-b6c9-876b88cfc927',
            'flowType': 'input',
            'flowName': 'Load Orders',
            'entityName': 'Order',
            'jobName': null,
            'startTime': '2018-10-30T00:22:09.907Z',
            'endTime': '2018-10-30T00:22:10.538Z',
            'jobOutput': ['Oct 29, 2018 5:22:10 PM com.marklogic.contentpump.LocalJobRunner applyConfigOptions\nINFO: Content type: JSON\nException in thread \'main\' java.lang.NoClassDefFoundError: org/apache/log4j/Level\n\tat org.apache.hadoop.mapred.JobConf.<clinit>(JobConf.java:357)\n\tat com.marklogic.contentpump.LocalJob.<init>(LocalJob.java:37)\n\tat com.marklogic.contentpump.LocalJob.getInstance(LocalJob.java:58)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:353)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)\nCaused by: java.lang.ClassNotFoundException: org.apache.log4j.Level\n\tat java.net.URLClassLoader.findClass(URLClassLoader.java:381)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:424)\n\tat sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:331)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:357)\n\t... 6 more'],
            'status': 'FAILED',
            'successfulEvents': 0,
            'failedEvents': 0,
            'successfulBatches': 0,
            'failedBatches': 0,
            'duration': 0,
            'iconClass': 'mdi-import',
            'hasLiveOutput': false
          }
        }, {
          'index': 5,
          'uri': '/jobs/d8661f4f-52fd-422b-b1c3-1bc79f5083f8.json',
          'path': 'fn:doc(\'/jobs/d8661f4f-52fd-422b-b1c3-1bc79f5083f8.json\')',
          'score': 0,
          'confidence': 0,
          'fitness': 0,
          'href': '/v1/documents?uri=%2Fjobs%2Fd8661f4f-52fd-422b-b1c3-1bc79f5083f8.json&database=data-hub-JOBS',
          'mimetype': 'application/json',
          'format': 'json',
          'content': {
            'jobId': 'd8661f4f-52fd-422b-b1c3-1bc79f5083f8',
            'flowType': 'input',
            'flowName': 'Load Products',
            'entityName': 'Product',
            'jobName': null,
            'startTime': '2018-10-30T00:21:54.360Z',
            'endTime': '2018-10-30T00:21:55.189Z',
            'jobOutput': ['Oct 29, 2018 5:21:55 PM com.marklogic.contentpump.LocalJobRunner applyConfigOptions\nINFO: Content type: JSON\nException in thread \'main\' java.lang.NoClassDefFoundError: org/apache/log4j/Level\n\tat org.apache.hadoop.mapred.JobConf.<clinit>(JobConf.java:357)\n\tat com.marklogic.contentpump.LocalJob.<init>(LocalJob.java:37)\n\tat com.marklogic.contentpump.LocalJob.getInstance(LocalJob.java:58)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:353)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)\nCaused by: java.lang.ClassNotFoundException: org.apache.log4j.Level\n\tat java.net.URLClassLoader.findClass(URLClassLoader.java:381)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:424)\n\tat sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:331)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:357)\n\t... 6 more'],
            'status': 'FAILED',
            'successfulEvents': 0,
            'failedEvents': 0,
            'successfulBatches': 0,
            'failedBatches': 0,
            'duration': 0,
            'iconClass': 'mdi-import',
            'hasLiveOutput': false
          }
        }],
        'facets': {
          'jobName': {'type': 'xs:string', 'facetValues': []},
          'status': {'type': 'xs:string', 'facetValues': [{'name': 'FAILED', 'count': 5, 'value': 'FAILED'}]},
          'entityName': {
            'type': 'xs:string',
            'facetValues': [{'name': 'Order', 'count': 4, 'value': 'Order'}, {
              'name': 'Product',
              'count': 1,
              'value': 'Product'
            }]
          },
          'flowName': {
            'type': 'xs:string',
            'facetValues': [{'name': 'Load Orders', 'count': 4, 'value': 'Load Orders'}, {
              'name': 'Load Products',
              'count': 1,
              'value': 'Load Products'
            }]
          },
          'flowType': {'type': 'xs:string', 'facetValues': [{'name': 'input', 'count': 5, 'value': 'input'}]}
        },
        'metrics': {
          'query-resolution-time': 'PT0.001776S',
          'facet-resolution-time': 'PT0.003835S',
          'snippet-resolution-time': 'PT0.000343S',
          'total-time': 'PT0.007465S'
        },
        'pageLength': 10
      }),
      jobs: object('jobs', [{
        'jobId': 'c751d0fc-12f5-4848-80ce-b842f06de547',
        'flowType': 'input',
        'flowName': 'Load Orders',
        'entityName': 'Order',
        'jobName': null,
        'startTime': '2018-10-30T00:25:54.940Z',
        'endTime': '2018-10-30T00:25:55.443Z',
        'jobOutput': ['java.lang.IllegalArgumentException: The setting for document_typeis not applicable to DELIMITED_TEXT\n\tat com.marklogic.contentpump.Command$1.applyConfigOptions(Command.java:457)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:348)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)'],
        'status': 'COMPLETE',
        'successfulEvents': 0,
        'failedEvents': 0,
        'successfulBatches': 0,
        'failedBatches': 0,
        'duration': 35,
        'iconClass': 'mdi-import',
        'hasLiveOutput': false
      }, {
        'jobId': '8292ae80-d862-4657-bb66-c4e35fca33ec',
        'flowType': 'input',
        'flowName': 'Load Orders',
        'entityName': 'Order',
        'jobName': null,
        'startTime': '2018-10-30T00:25:16.926Z',
        'endTime': '2018-10-30T00:25:17.601Z',
        'jobOutput': ['Oct 29, 2018 5:25:17 PM com.marklogic.contentpump.LocalJobRunner applyConfigOptions\nINFO: Content type: JSON\nException in thread \'main\' java.lang.NoClassDefFoundError: org/apache/log4j/Level\n\tat org.apache.hadoop.mapred.JobConf.<clinit>(JobConf.java:357)\n\tat com.marklogic.contentpump.LocalJob.<init>(LocalJob.java:37)\n\tat com.marklogic.contentpump.LocalJob.getInstance(LocalJob.java:58)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:353)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)\nCaused by: java.lang.ClassNotFoundException: org.apache.log4j.Level\n\tat java.net.URLClassLoader.findClass(URLClassLoader.java:381)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:424)\n\tat sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:331)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:357)\n\t... 6 more'],
        'status': 'FAILED',
        'successfulEvents': 0,
        'failedEvents': 0,
        'successfulBatches': 0,
        'failedBatches': 0,
        'duration': 0,
        'iconClass': 'mdi-import',
        'hasLiveOutput': false
      }, {
        'jobId': '66e543a6-99a4-498e-ace4-4e20cb944739',
        'flowType': 'input',
        'flowName': 'Load Orders',
        'entityName': 'Order',
        'jobName': null,
        'startTime': '2018-10-30T00:24:01.739Z',
        'endTime': '2018-10-30T00:24:02.392Z',
        'jobOutput': ['java.lang.IllegalArgumentException: Only one of generate_uri and uri_id can be specified\n\tat com.marklogic.contentpump.Command$1.applyUriId(Command.java:421)\n\tat com.marklogic.contentpump.Command$1.applyConfigOptions(Command.java:460)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:348)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)'],
        'status': 'FAILED',
        'successfulEvents': 0,
        'failedEvents': 0,
        'successfulBatches': 0,
        'failedBatches': 0,
        'duration': 0,
        'iconClass': 'mdi-import',
        'hasLiveOutput': false
      }, {
        'jobId': 'a7e9cf5f-4786-4739-b6c9-876b88cfc927',
        'flowType': 'input',
        'flowName': 'Load Orders',
        'entityName': 'Order',
        'jobName': null,
        'startTime': '2018-10-30T00:22:09.907Z',
        'endTime': '2018-10-30T00:22:10.538Z',
        'jobOutput': ['Oct 29, 2018 5:22:10 PM com.marklogic.contentpump.LocalJobRunner applyConfigOptions\nINFO: Content type: JSON\nException in thread \'main\' java.lang.NoClassDefFoundError: org/apache/log4j/Level\n\tat org.apache.hadoop.mapred.JobConf.<clinit>(JobConf.java:357)\n\tat com.marklogic.contentpump.LocalJob.<init>(LocalJob.java:37)\n\tat com.marklogic.contentpump.LocalJob.getInstance(LocalJob.java:58)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:353)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)\nCaused by: java.lang.ClassNotFoundException: org.apache.log4j.Level\n\tat java.net.URLClassLoader.findClass(URLClassLoader.java:381)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:424)\n\tat sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:331)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:357)\n\t... 6 more'],
        'status': 'COMPLETE',
        'successfulEvents': 0,
        'failedEvents': 0,
        'successfulBatches': 0,
        'failedBatches': 0,
        'duration': 59,
        'iconClass': 'mdi-import',
        'hasLiveOutput': false
      }, {
        'jobId': 'd8661f4f-52fd-422b-b1c3-1bc79f5083f8',
        'flowType': 'input',
        'flowName': 'Load Products',
        'entityName': 'Product',
        'jobName': null,
        'startTime': '2018-10-30T00:21:54.360Z',
        'endTime': '2018-10-30T00:21:55.189Z',
        'jobOutput': ['Oct 29, 2018 5:21:55 PM com.marklogic.contentpump.LocalJobRunner applyConfigOptions\nINFO: Content type: JSON\nException in thread \'main\' java.lang.NoClassDefFoundError: org/apache/log4j/Level\n\tat org.apache.hadoop.mapred.JobConf.<clinit>(JobConf.java:357)\n\tat com.marklogic.contentpump.LocalJob.<init>(LocalJob.java:37)\n\tat com.marklogic.contentpump.LocalJob.getInstance(LocalJob.java:58)\n\tat com.marklogic.contentpump.Command$1.createJob(Command.java:353)\n\tat com.marklogic.contentpump.ContentPump.runCommand(ContentPump.java:226)\n\tat com.marklogic.contentpump.ContentPump.main(ContentPump.java:74)\nCaused by: java.lang.ClassNotFoundException: org.apache.log4j.Level\n\tat java.net.URLClassLoader.findClass(URLClassLoader.java:381)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:424)\n\tat sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:331)\n\tat java.lang.ClassLoader.loadClass(ClassLoader.java:357)\n\t... 6 more'],
        'status': 'FAILED',
        'successfulEvents': 0,
        'failedEvents': 0,
        'successfulBatches': 0,
        'failedBatches': 0,
        'duration': 0,
        'iconClass': 'mdi-import',
        'hasLiveOutput': false
      }]),
      activeFacets: object('activeFacets', {'status': {'values': ['FAILED']}}),
      selectedJobs: object('selectedJobs', []),
      doSearch: action('Do Search'),
      exportJobs: action('Export Jobs'),
      pageChanged: action('Page Changed'),
      updateFacets: action('Update Facets'),
      searchTextChanged: action('Search Text Changed'),
      showConsole: action('Show Console'),
      showTraces: action('Show Traces'),
      toggleSelectJob: action('Toggle Select Job')
    }
  }));
