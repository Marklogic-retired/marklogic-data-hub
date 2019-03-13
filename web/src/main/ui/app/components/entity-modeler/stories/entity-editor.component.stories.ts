import {moduleMetadata, storiesOf} from '@storybook/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../../utils';
import {EntityEditorComponent, ThemeModule} from '../../../components/';
import {MdlDialogService} from '@angular-mdl/core';
import {Component, EventEmitter, Input, NgModule, Output} from '@angular/core';

@Component({
  selector: 'app-entity-editor-button',
  template: '<button (click)="openModal()">Open Modal</button>'
})
export class EntityEditorButtonComponent {
  @Input() entity: any;
  @Input() dataTypes: Array<any>;
  @Output() saveClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();

  constructor(
    private dialogService: MdlDialogService
  ) {
  }

  openModal() {
    this.dialogService.showCustomDialog({
      component: EntityEditorComponent,
      providers: [
        {
          provide: 'actions',
          useValue: {
            save: () => {
              this.saveClicked.emit();
            },
            cancel: () => {
              this.cancelClicked.emit();
            }
          }
        },
        {
          provide: 'entity',
          useValue: this.entity
        },
        {
          provide: 'dataTypes',
          useValue: this.dataTypes
        }
      ],
      isModal: true
    });
  }
}

@NgModule({
  declarations: [EntityEditorButtonComponent]
})
export class EntityEdtiorButtonModule {
}

storiesOf('Components|Entity Editor', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [EntityEditorComponent, StoryCardComponent, EntityEditorButtonComponent],
      entryComponents: [EntityEditorComponent],
      providers: [MdlDialogService]
    })
  )
  .add('Entity Editor Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="500" [height]="150">
                <app-entity-editor-button
                  [entity]="entity"
                  [dataTypes]="dataTypes"
                  (saveClicked)="saveClicked()"
                  (cancelClicked)="cancelClicked()"
                ></app-entity-editor-button>
              </mlui-story-card>
              <dialog-outlet></dialog-outlet>
            </mlui-dhf-theme>
        `,
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
        }],
        fromJSON: () => action('cancel/close clicked'),
      }),
      dataTypes: object('dataTypes', [
        {
          label: '',
          value: '',
          disabled: true
        }
      ]),
      saveClicked: action('save clicked'),
      cancelClicked: action('cancel clicked')
    },
  }));
