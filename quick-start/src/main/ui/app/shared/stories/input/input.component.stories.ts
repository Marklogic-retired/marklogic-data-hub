import {CommonModule} from '@angular/common';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {
  object,
  text,
  boolean,
  withKnobs
} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {StoryCardComponent} from '../../../utils/stories/story-card.component';
import {ThemeModule} from '../../../components/theme/theme.module';

storiesOf('Inputs', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, BrowserAnimationsModule, ThemeModule],
      schemas: [],
      declarations: [StoryCardComponent],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Outline Input Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="'500px'" [height]="'250px'">
                <mat-form-field appearance="outline">
                  <mat-label>{{label}}</mat-label>
                  <input matInput
                  [ngModel]="value"
                  [id]="field"
                  (input)="handleValueChanged($event)"
                  />
                </mat-form-field>
                <mat-form-field appearance="outline"
                  class='read-only'>
                <mat-label>{{readOnlyLabel}}</mat-label>
                <input matInput
                [id]="field"
                [value]="readOnlyValue"
                [readonly]="true"/>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{disabledLabel}}</mat-label>
                <input matInput
                [id]="field"
                [value]="disabledValue"
                [disabled]="true"/>
              </mat-form-field>
              </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      label: text('Label', 'Sample Label'),
      handleValueChanged: action('Value Change: '),
      readOnlyLabel: text('Read Only Label', 'Read Only'),
      readOnlyValue: text('Read Only Value', ''),
      disabledLabel: text('Disabled Label', 'Disabled'),
      disabledValue: text('Disabled Value', '')
    }
  }))
  .add('Standard Input Component', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="'500px'" [height]="'250px'">
                <mat-form-field appearance="standard">
                  <mat-label>{{label}}</mat-label>
                  <input matInput
                  [ngModel]="value"
                  [id]="field"
                  (input)="handleValueChanged($event)"
                  />
                </mat-form-field>
                <mat-form-field appearance="standard"
                  class='read-only'>
                <mat-label>{{readOnlyLabel}}</mat-label>
                <input matInput
                [id]="field"
                [value]="readOnlyValue"
                [readonly]="true"/>
              </mat-form-field>
              <mat-form-field appearance="standard">
                <mat-label>{{disabledLabel}}</mat-label>
                <input matInput
                [id]="field"
                [value]="disabledValue"
                [disabled]="true"/>
              </mat-form-field>
              </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      label: text('Label', 'Sample Label'),
      handleValueChanged: action('Value Change: '),
      readOnlyLabel: text('Read Only Label', 'Read Only'),
      readOnlyValue: text('Read Only Value', ''),
      disabledLabel: text('Disabled Label', 'Disabled'),
      disabledValue: text('Disabled Value', '')
    }
  }));
