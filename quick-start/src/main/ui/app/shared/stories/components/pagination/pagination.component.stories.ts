import {CommonModule} from '@angular/common';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {
  object,
  text,
  boolean,
  withKnobs
} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../utils/story-card/story-card.component';
import {PaginationComponent} from '../../../components/pagination';
import {ThemeModule} from "../../../components/theme/theme.module";

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
      start: 1,
      total: 120,
      pageLength: 10,
      pageChanged: action('Page Changed')
    }
  }));
