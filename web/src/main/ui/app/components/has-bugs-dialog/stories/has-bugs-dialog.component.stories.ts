import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, withKnobs} from '@storybook/addon-knobs';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../../utils';
import {HasBugsDialogComponent, ThemeModule} from '../..';
import {MdlDialogService} from '@angular-mdl/core';
import {Component, Input, NgModule} from '@angular/core';
import {ObjectToArrayPipe} from '../../../object-to-array.pipe';

@Component({
  selector: 'app-has-bugs-dialog-button',
  template: '<button (click)="openModal()">Open Modal</button>'
})
export class HasBugsDialogButtonComponent {
  @Input() errors: any;

  constructor(
    private dialogService: MdlDialogService
  ) {
  }

  openModal() {
    this.dialogService.showCustomDialog({
      component: HasBugsDialogComponent,
      providers: [
        {
          provide: 'errors',
          useValue: this.errors
        }
      ],
      isModal: true
    });
  }
}

@NgModule({
  declarations: [HasBugsDialogButtonComponent]
})
export class HasBugsDialogButtonModule {
}

storiesOf('Components|Has Bugs Dialog', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [
        HasBugsDialogComponent,
        StoryCardComponent,
        HasBugsDialogButtonComponent,
        ObjectToArrayPipe
      ],
      entryComponents: [HasBugsDialogComponent],
      providers: [MdlDialogService]
    })
  )
  .add('Has Bugs Dialog Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="500" [height]="150">
                <app-has-bugs-dialog-button
                  [errors]="errors"
                ></app-has-bugs-dialog-button>
              </mlui-story-card>
              <dialog-outlet></dialog-outlet>
            </mlui-dhf-theme>
        `,
    props: {
      errors: object('errors', {
        'content': {
          'msg': 'JS-JAVASCRIPT: createContent: createContent555 -- Error running JavaScript request: ReferenceError: createContent555 is not defined',
          'uri': '/entities/Order/input/Load Orders/content/content.sjs',
          'line': 16,
          'column': 17
        }
      })
    },
  }));
