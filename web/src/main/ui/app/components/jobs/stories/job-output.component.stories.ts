import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {object, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {JobOutputUiComponent, ThemeModule} from "../..";

storiesOf('Components|Jobs', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, HttpModule],
      schemas: [],
      declarations: [
        JobOutputUiComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Job Output Component', () => ({
    template: `
          <mlui-dhf-theme>
            <mlui-story-card [width]="'1500px'" [height]="'768px'">
              <app-job-output-ui     
                [job]="job"
                [jobOutput]="jobOutput"
                (cancelClicked)="cancelClicked($event)"
              ></app-job-output-ui>
            </mlui-story-card>
          </mlui-dhf-theme>`,
    props: {
      job: object('object', {
        'jobId': 'ccacd1fc-6cf5-4a6f-ad8c-6505cb0be062',
        'flowType': 'input',
        'flowName': 'Load Products',
        'entityName': 'Product',
        'jobName': null,
        'startTime': '2018-11-01T23:02:19.905Z',
        'endTime': '2018-11-01T23:02:24.686Z',
        'jobOutput': ['16:02:21.364 [main] INFO  c.m.contentpump.LocalJobRunner - Content type: JSON\n16:02:21.649 [main] INFO  c.marklogic.contentpump.ContentPump - Job name: local_996909957_1\n16:02:21.675 [main] INFO  c.m.c.FileAndDirectoryInputFormat - Total input paths to process : 4\n16:02:23.121 [Thread-4] INFO  c.m.contentpump.LocalJobRunner -  completed 75%\n16:02:24.652 [Thread-4] INFO  c.m.contentpump.LocalJobRunner -  completed 100%\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - com.marklogic.mapreduce.MarkLogicCounter: \n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - INPUT_RECORDS: 450\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - OUTPUT_RECORDS: 450\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - OUTPUT_RECORDS_COMMITTED: 450\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - OUTPUT_RECORDS_FAILED: 0\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - Total execution time: 3 sec'],
        'status': 'FINISHED',
        'successfulEvents': 450,
        'failedEvents': 0,
        'successfulBatches': 0,
        'failedBatches': 0,
        'duration': 4,
        'iconClass': 'mdi-import',
        'hasLiveOutput': false
      }),
      jobOutput: object('object', ['16:02:21.364 [main] INFO  c.m.contentpump.LocalJobRunner - Content type: JSON\n16:02:21.649 [main] INFO  c.marklogic.contentpump.ContentPump - Job name: local_996909957_1\n16:02:21.675 [main] INFO  c.m.c.FileAndDirectoryInputFormat - Total input paths to process : 4\n16:02:23.121 [Thread-4] INFO  c.m.contentpump.LocalJobRunner -  completed 75%\n16:02:24.652 [Thread-4] INFO  c.m.contentpump.LocalJobRunner -  completed 100%\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - com.marklogic.mapreduce.MarkLogicCounter: \n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - INPUT_RECORDS: 450\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - OUTPUT_RECORDS: 450\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - OUTPUT_RECORDS_COMMITTED: 450\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - OUTPUT_RECORDS_FAILED: 0\n16:02:24.658 [main] INFO  c.m.contentpump.LocalJobRunner - Total execution time: 3 sec']),
      cancelClicked: action('cancelClicked')
    }
  }));
