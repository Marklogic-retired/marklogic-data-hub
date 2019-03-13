import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {InlineEditComponent} from '../inline-edit.component';
import {ThemeModule} from "../..";

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
