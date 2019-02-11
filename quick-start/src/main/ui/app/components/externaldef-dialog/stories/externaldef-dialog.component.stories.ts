import {moduleMetadata, storiesOf} from '@storybook/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../../utils';
import {ExternalDefDialogComponent, ThemeModule} from '../../../components/';
import {MdlDialogService} from '@angular-mdl/core';
import {Component, EventEmitter, NgModule, Output} from '@angular/core';

@Component({
  selector: 'app-external-def-button',
  template: '<button (click)="openModal()">Open Modal</button>'
})
export class ExternalDialogButtonComponent {
  @Output() saveClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();
  @Output() setExternalRef = new EventEmitter();

  constructor(
    private dialogService: MdlDialogService
  ) {
  }

  openModal() {
    this.dialogService.showCustomDialog({
      component: ExternalDefDialogComponent,
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
          provide: 'property',
          useValue: {
            setExternalRef: () => {
              this.setExternalRef.emit();
            }
          }
        }
      ],
      isModal: true
    });
  }
}

@NgModule({
  declarations: [ExternalDialogButtonComponent]
})
export class ExternalDialogButtonModule {
}

storiesOf('Components|External Def Dialog', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [ExternalDefDialogComponent, StoryCardComponent, ExternalDialogButtonComponent],
      entryComponents: [ExternalDefDialogComponent],
      providers: [MdlDialogService]
    })
  )
  .add('External Def Dialog Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="500" [height]="150">
                <app-external-def-button
                  (saveClicked)="saveClicked()"
                  (cancelClicked)="cancelClicked()"
                  (setExternalRef)="setExternalRef()"
                ></app-external-def-button>
              </mlui-story-card>
              <dialog-outlet></dialog-outlet>
            </mlui-dhf-theme>
        `,
    props: {
      saveClicked: action('save clicked'),
      cancelClicked: action('cancel clicked'),
      setExternalRef: action('cancel clicked')
    },
  }));
