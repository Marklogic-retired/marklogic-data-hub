import {moduleMetadata, storiesOf} from '@storybook/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../../utils';
import {EntityBoxComponent, ResizableComponent, ThemeModule} from '../..';

storiesOf('Components|Entity Box', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [EntityBoxComponent, StoryCardComponent, ResizableComponent]

    })
  )
  .add('Entity Box Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card width="'350px'" [height]="'auto'">
                <app-entity-box
                    [entity]="entity"
                    [selected]="selected"
                    [dataTypes]="dataTypes"
                    (dragStart)="dragStart($event)"
                    (entityStateChange)="entityStateChange($event)"
                    (onStartEditing)="onStartEditing($event)"
                    (onDeleteEntity)="onDeleteEntity($event)"
                ></app-entity-box>
              </mlui-story-card>
            </mlui-dhf-theme>
        `,
    styles: [`
        :host ::ng-deep .story-card {
            overflow: overlay 
        }
        `],
    props: {
      entity: object('entity', {
        definition: {
          description: null,
          name: null,
          primaryKey: null,
          properties: [],
          elementRangeIndex: [],
          rangeIndex: [],
          required: [],
          wordLexicon: [],
          pii: []
        },
        filename: null,
        hubUi: {
          x: 10,
          y: 115,
          width: 350,
          height: 100
        },
        info: {
          baseUri: null,
          description: 'Entity Description',
          title: 'Entity Title',
          version: '0.0.1'
        },
        inputFLows: [{
          length: null
        }],
        harmonizeFlows: [{
          length: null
        }]
      }),
      selected: boolean('keyLabel', false),
      dataTypes: Array('dataTypes', 'Value'),
      dragStart: action('drag starting'),
      entityStateChange: action('entity state changed'),
      onStartEditing: action('start editing'),
      onDeleteEntity: action('delete entity')
    },
  }));
