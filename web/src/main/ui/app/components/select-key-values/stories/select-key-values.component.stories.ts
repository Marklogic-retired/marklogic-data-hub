import {moduleMetadata, storiesOf} from '@storybook/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../../utils';
import {SelectKeyValuesComponent} from '../select-key-values.component';
import {ThemeModule} from '../..';

storiesOf('Components|Select Key Values', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [SelectKeyValuesComponent, StoryCardComponent]

    })
  )
  .add('Select Key Values Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="'450px'" [height]="'auto'">
                <app-select-key-values
                    [title]="title"
                    [keyLabel]="keyLabel"
                    [valLabel]="valLabel"
                    [keyVals]="keyVals"
                    (onChange)="onChange($event)"
                    (onAdd)="onAdd($event)"
                    (onRemove)="onRemove($event)"
                ></app-select-key-values>
              </mlui-story-card>
            </mlui-dhf-theme>
        `,
    styles: [`
        :host ::ng-deep .story-card {
            overflow: overlay
        }
        `],
    props: {
      title: text('title', 'Title'),
      keyLabel: text('keyLabel', 'Key Label'),
      valLabel: text('valLabel', 'Value Label'),
      keyVals: object(
        'Keys',
        [
          {
            key: 'Option N1',
            val: 'ValueN1'
          },
          {
            key: 'Option N2',
            val: 'ValueN2'
          },
          {
            key: 'Option N3',
            val: 'ValueN3'
          },
          {
            key: 'Option N4',
            val: 'ValueN4'
          },
          {
            key: 'Option N5',
            val: 'ValueN5'
          }
        ]
      ),
      onChange: action('on change'),
      onAdd: action('on add'),
      onRemove: action('on remove')
    },
  }));
