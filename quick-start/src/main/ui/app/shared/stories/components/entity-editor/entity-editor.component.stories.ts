import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, text, boolean, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../utils';
import {ThemeModule, EntityEditorComponent} from '../../../components/';
import {MdlDialogService, MdlDialogReference} from '@angular-mdl/core';
import { Component, Input, Output, EventEmitter, NgModule } from '@angular/core';

 @Component({
  selector: 'app-entity-editor-button',
  template: '<button (click)="openModal()">Open Modal</button>'
})
export class EntityEditorButtonComponent {
  @Output() saveClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();
  constructor(
    private dialogService: MdlDialogService
  ) { }
  openModal() {
    this.dialogService.showCustomDialog({
      component: EntityEditorComponent,
      providers: [
        { provide: 'actions',
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
          useValue: {}
        },
        {
          provide: 'dataTypes',
          useValue: []
        }
      ],
      isModal: true
    });
  }
}
 @NgModule({
  declarations: [EntityEditorButtonComponent]
})
export class EntityEdtiorButtonModule {}

 storiesOf('Components|Choose Collation', module)
    .addDecorator(withKnobs)
    .addDecorator(centered)
    .addDecorator(
        moduleMetadata({
            imports: [
                ThemeModule
            ],
            declarations: [EntityEditorComponent, StoryCardComponent, EntityEditorButtonComponent, MdlDialogReference],
            entryComponents: [EntityEditorComponent],
            providers: [MdlDialogService]
        })
    )
    .add('Choose Collation Component', () => ({
        template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="500" [height]="150">
                <app-entity-editor
                  (saveClicked)="saveClicked()"
                  (cancelClicked)="cancelClicked()"
                ></app-entity-editor
              </mlui-story-card>
              <dialog-outlet></dialog-outlet>
            </mlui-dhf-theme>
        `,
        props: {
          saveClicked: action('save clicked'),
          cancelClicked: action('cancel clicked')
        },
    }));
