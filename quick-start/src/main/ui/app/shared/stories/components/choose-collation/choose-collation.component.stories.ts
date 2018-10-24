import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, text, boolean, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../utils/story-card/story-card.component';
import {ChooseCollationComponent} from '../../../components/choose-collation/choose-collation.component';
import {ThemeModule} from '../../../components/theme/theme.module';
import {MdlDialogService} from '@angular-mdl/core';
import { Component, Input, Output, EventEmitter, NgModule } from '@angular/core';

 @Component({
  selector: 'app-dialog-button',
  template: '<button (click)="openModal()">Open Modal</button>'
})
export class CollationButtonComponent {
  //@Input() selectedCollation: string;
  @Output() createClicked = new EventEmitter();
  constructor(
    private dialogService: MdlDialogService
  ) { }
  openModal() {
    this.dialogService.showCustomDialog({
      component: ChooseCollationComponent,
      providers: [
        { provide: 'actions',
          useValue: {
            save: () => {
              this.createClicked.emit();
            },
            cancel: () => {
              console.log('cancel');
            }
          }
        },
        {
          provide: 'collation',
          useValue: this.selectedCollation
        }
      ],
      isModal: true
    });
  }
}
 @NgModule({
  declarations: [CollationButtonComponent]
})
export class CollationButtonModule {}

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
                <app-dialog-button
 
                (createClicked)="createClicked()"
                ></app-dialog-button>
              </mlui-story-card>
              <dialog-outlet></dialog-outlet>
            </mlui-dhf-theme>
        `,
        props: {
          //selectedCollation: text('Value', 'test'),
          createClicked: action('create entity clicked')
        },
    }));
