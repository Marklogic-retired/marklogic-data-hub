import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, text, boolean, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../../utils';
import {ThemeModule, ChooseCollationComponent} from '../../../components/';
import {MdlDialogService} from '@angular-mdl/core';
import {Component, Input, Output, EventEmitter, NgModule} from '@angular/core';

@Component({
  selector: 'app-collation-button',
  template: '<button (click)="openModal()">Open Modal</button>'
})
export class CollationButtonComponent {
  @Output() saveClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();

  constructor(
    private dialogService: MdlDialogService
  ) {
  }

  openModal() {
    this.dialogService.showCustomDialog({
      component: ChooseCollationComponent,
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
          provide: 'collation',
          useValue: ''
        }
      ],
      isModal: true
    });
  }
}

@NgModule({
  declarations: [CollationButtonComponent]
})
export class CollationButtonModule {
}

storiesOf('Components|Choose Collation', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [ChooseCollationComponent, StoryCardComponent, CollationButtonComponent],
      entryComponents: [ChooseCollationComponent],
      providers: [MdlDialogService]
    })
  )
  .add('Choose Collation Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="500" [height]="150">
                <app-collation-button
                  (saveClicked)="saveClicked()"
                  (cancelClicked)="cancelClicked()"
                ></app-collation-button>
              </mlui-story-card>
              <dialog-outlet></dialog-outlet>
            </mlui-dhf-theme>
        `,
    props: {
      saveClicked: action('save clicked'),
      cancelClicked: action('cancel clicked')
    },
  }));
