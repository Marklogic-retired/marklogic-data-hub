import 'rxjs/add/observable/of';

import { CommonModule } from '@angular/common';
import { centered } from '@storybook/addon-centered/angular';
import { moduleMetadata, storiesOf } from '@storybook/angular';
import {
  object,
  text,
  boolean,
  number,
  withKnobs
} from '@storybook/addon-knobs';
import { SearchViewerUiComponent } from '../../../components/search';
import { ThemeModule } from '../../../components/theme';
import { StoryCardComponent } from '../../utils/story-card/story-card.component';
import { CodemirrorComponent } from '../../../components/codemirror';

storiesOf('Components|Search', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        CodemirrorComponent,
        SearchViewerUiComponent,
        StoryCardComponent],
      entryComponents: [],
    })
  )
  .addDecorator(centered)
  .add('Search Viewer Component', () => ({
    template: `
            <mlui-dhf-theme width = "1000px">
              <mlui-story-card width="800px" height="800px">
                    <app-search-viewer-ui
                      [uri]="sampleUri"
                      [doc]="sampleDoc"
                      [codeMirrorConfig]="codeMirrorConfig"
                    ></app-search-viewer-ui>
              </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      codeMirrorConfig: object('codemirrorConfig', {
        lineNumbers: true,
        indentWithTabs: true,
        lineWrapping: true,
        readOnly: true,
        cursorBlinkRate: 0
      }),
      sampleUri: text('sampleUri', 'doc/sample.json'),
      sampleDoc: `
      {
        "envelope": {
          "headers": {},
          "triples": [],
          "instance": {
            "id": "800",
            "customer": "294",
            "order_date": "08/27/2017",
            "ship_date": "09/04/2017",
            "product_id": "1000200",
            "sku": "267154901716",
            "price": "19.99",
            "quantity": "1.0",
            "discounted_price": "19.99",
            "title": "gothic cuckoo Extension 2",
            "description": ""
          },
          "attachments": null
        }
      }`
    }
  }));
