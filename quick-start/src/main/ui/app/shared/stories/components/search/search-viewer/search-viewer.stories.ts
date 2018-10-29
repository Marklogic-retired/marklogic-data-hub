import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterTestingModule } from '@angular/router/testing';
import { action } from '@storybook/addon-actions';
import { centered } from '@storybook/addon-centered/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { moduleMetadata, storiesOf } from '@storybook/angular';

import { SearchViewerComponent } from '../../../../components/search/search-viewer/search-viewer.component';
import { ThemeModule } from '../../../../components/theme/theme.module';
import { StoryCardComponent } from '../../../utils/story-card/story-card.component';
import { SearchService } from './../../../../../search/search.service';
import { CodemirrorComponent } from './../../../../../codemirror/codemirror.component';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/of';



class SearchServiceMock {
  getDoc(database: string, docUri: string) {
    const mockDoc = `
      {"info":{"title":"Order", "version":"0.0.1"},
      "definitions":{"Order":{"primaryKey":"id", "required":[],
      "pii":[], "elementRangeIndex":[], "rangeIndex":["id"], "wordLexicon":[],
      "properties":{"id":{"datatype":"string", "collation":"http://marklogic.com/collation/codepoint"},
      "price":{"datatype":"decimal"}, "products":{"datatype":"array", "items":{"$ref":"#/definitions/Product"}}}}}}
    `;
    return Observable.of(JSON.parse(mockDoc));
  }
}


storiesOf('Components|Search', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, RouterTestingModule],
      schemas: [],
      declarations: [
        CodemirrorComponent,
        SearchViewerComponent,
        StoryCardComponent],
      entryComponents: [],
      providers: [
        { provide: SearchService, useClass: SearchServiceMock }
      ]
    })
  )
  .addDecorator(centered)
  .add('Search Viewer Component', () => ({
    template: `
            <mlui-dhf-theme width = "1000px">
              <mlui-story-card width="800px" height="800px">
                    <app-search-viewer
                      [uri]="sampleUri"
                    ></app-search-viewer>
              </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      sampleUri: 'doc/sample.json',
    }
  }));
