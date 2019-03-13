import {moduleMetadata, storiesOf} from '@storybook/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../../utils';
import {SelectComponent} from '../select.component';
import {ThemeModule} from '../..';

storiesOf('Components|Select', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [SelectComponent, StoryCardComponent]
    })
  )
  .add('Select Component', () => ({
    template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="500" [height]="150">
                        <app-custom-select
                            [id]="id"
                            [items]="items"
                            [initialSelectedItem]="initialSelectedItem"
                            [labelText]="labelText"
                            [label]="label"
                            [value]="value"
                            [readOnly]="readOnly"
                            [allowRemove]="allowRemove"
                            (selectedItem)="selectedItem($event)"
                        ></app-custom-select>
                </mlui-story-card>
            </mlui-dhf-theme>
        `,
    props: {
      initialSelectedItem: text('initialSelectedItem', 'ValueN3'),
      labelText: text('Label', 'Label'),
      label: text('Label', 'label'),
      value: text('Value', 'value'),
      readOnly: boolean('readOnly', false),
      allowRemove: boolean('allowRemove', false),
      items: object(
        'Items',
        [
          {
            label: 'Option N1',
            value: 'ValueN1'
          },
          {
            label: 'Option N2',
            value: 'ValueN2'
          },
          {
            label: 'Option N3',
            value: 'ValueN3'
          },
          {
            label: 'Option N4',
            value: 'ValueN4'
          },
          {
            label: 'Option N5',
            value: 'ValueN5'
          }
        ]
      ),
      selectedItem: action('Item Selected:')
    },
  }));
