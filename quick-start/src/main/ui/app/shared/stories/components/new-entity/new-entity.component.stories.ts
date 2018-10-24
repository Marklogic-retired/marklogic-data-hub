import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, text, boolean, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../utils/story-card/story-card.component';
import {NewEntityComponent} from '../../../components/new-entity/new-entity.component';
import {ThemeModule} from '../../../components/theme/theme.module';
import {MdlDialogService} from '@angular-mdl/core';
import { Component, Output, EventEmitter, NgModule } from '@angular/core';

@Component({
  selector: 'app-dialog-button',
  template: '<button (click)="openModal()">Open Modal</button>'
})
export class DialogButtonComponent {
  @Output() createClicked = new EventEmitter();
  constructor(
    private dialogService: MdlDialogService
  ) { }
  openModal() {
    this.dialogService.showCustomDialog({
      component: NewEntityComponent,
      providers: [
        { provide: 'actions', useValue: {save: () => {
          this.createClicked.emit();
        }}}
      ],
      isModal: true
    });
  }
}

@NgModule({
  declarations: [DialogButtonComponent]
})
export class DialogButtonModule {}

storiesOf('Components|New Entity', module)
    .addDecorator(withKnobs)
    .addDecorator(centered)
    .addDecorator(
        moduleMetadata({
            imports: [
                ThemeModule
            ],
            declarations: [NewEntityComponent, StoryCardComponent, DialogButtonComponent],
            entryComponents: [NewEntityComponent],
            providers: [MdlDialogService]
        })
    )
    .add('New Entity Component', () => ({
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
          createClicked: action('create entity clicked')
        },
    }));
