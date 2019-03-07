import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {ThemeModule} from "../../index";
import {TooltipContainerUiComponent} from "../ui";


storiesOf('Components|Tooltip', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, HttpModule],
      schemas: [],
      declarations: [
        TooltipContainerUiComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Tooltip Component', () => ({
    template: `
           <mlui-dhf-theme>
                <app-tooltip-container-ui
                  [isTemplate]="isTemplate"
                  [classMap]="classMap"
                  [top]="top"
                  [left]="left"
                  [display]="display"
                  [context]="context"
                  [content]="content"
                  [htmlContent]="htmlContent"
                ></app-tooltip-container-ui>
          </mlui-dhf-theme>`,
    props: {
      isTemplate: boolean('isTemplate', false),
      classMap: object('classMap', {"in": true, "fade": true, "innerRight": true, "tooltip-innerRight": true}),
      context: object('context', undefined),
      content: text('content', `A comma separated list of (role,capability) pairs to apply to loaded documents.
      Default: The default permissions associated with the user inserting the document.`),
      htmlContent: text('htmlContent', undefined),
      top: text('top', '38%'),
      left: text('left', '38%'),
      display: text('display', 'block')
    }
  }));
