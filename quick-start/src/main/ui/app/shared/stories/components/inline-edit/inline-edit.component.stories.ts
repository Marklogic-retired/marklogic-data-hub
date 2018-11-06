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
import {InlineEditComponent} from '../../../components/inline-edit/inline-edit.component';
import {ThemeModule} from "../../../components/theme/theme.module";

storiesOf('Components|Inline Edit', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [InlineEditComponent, StoryCardComponent],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Inline Edit Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="'150px'" [height]="'50px'">
              <app-inline-edit
                [key]="key"
                [value]="value"
                (valueChange)="valueChange($event)"
                [editing]="editing"
                (editingChange)="editingChange($event)"
              ></app-inline-edit>
              </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      key: text('Key', 'Key'),
      value: text('Value', 'value'),
      editing: boolean('editing', false),
      valueChange: action('Value Change: '),
      editingChange: action('Editing Change: ')
    }
  }));
