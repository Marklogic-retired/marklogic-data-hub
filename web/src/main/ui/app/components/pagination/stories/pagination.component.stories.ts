import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {PaginationComponent} from '..';
import {ThemeModule} from "../..";

storiesOf('Components|Pagination', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        PaginationComponent,
        StoryCardComponent],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Pagination Component', () => ({
    template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="'800px'" [height]="'150px'">
                    <app-pagination
                        [start]="start"
                        [total]="total"
                        [pageLength]="pageLength"
                        (pageChanged)="pageChanged($event)"
                    ></app-pagination>
                </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      start: number('start', 1),
      total: number('total', 120),
      pageLength: number('pageLength', 10),
      pageChanged: action('Page Changed')
    }
  }));
