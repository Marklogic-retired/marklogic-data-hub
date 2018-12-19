import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, array, text, boolean, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import { TooltipModule } from 'ngx-bootstrap';
import {CommonModule} from '@angular/common';
import {StoryCardComponent} from '../../utils/story-card/story-card.component';
import { MdlDialogService } from '@angular-mdl/core';
import {
  DashboardUiComponent,
  ThemeModule
} from '../../../components/';

storiesOf('Components|Dashboard', module)
    .addDecorator(withKnobs)
    .addDecorator(centered)
    .addDecorator(
        moduleMetadata({
            imports: [
              TooltipModule.forRoot(),
                ThemeModule
            ],
            declarations: [DashboardUiComponent, StoryCardComponent],
            providers: [TooltipModule]

        })
    )
    .add('Dashboard Component', () => ({
        template: `
            <mlui-dhf-theme>
              <mlui-story-card width="'350px'" [height]="'auto'">
              <app-dashboard-ui
                [rows]="rows"
                [databases]="databases"
                [stats]="stats"
                (clearDatabase)="clearDatabase($event)"
                (clearAllDatabases)="clearAllDatabases()"
              ></app-dashboard-ui>
              </mlui-story-card>
            </mlui-dhf-theme>
        `,
        props: {
            stats: object('stats', {
              finalCount: 4,
              finalDb: "data-hub-FINAL",
              jobCount:   159,
              jobDb:  "data-hub-JOBS",
              stagingCount: 27,
              stagingDb:  "data-hub-STAGING",
              traceCount: 159,
              traceDb:  "data-hub-JOBS"
            }),
            rows: array('rows', [0, 1]),
            databases: array('entity', ['staging', 'final', 'job']),
            clearDatabase: action('clear db'),
            clearAllDatabases: action('clear all db')
        },
    }));
