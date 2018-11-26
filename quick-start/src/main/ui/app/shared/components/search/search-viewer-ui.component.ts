import { Component, OnInit, OnDestroy, ViewEncapsulation, Input} from '@angular/core';

import * as _ from 'lodash';

require('codemirror/mode/xquery/xquery');
require('codemirror/mode/javascript/javascript');

@Component({
  selector: 'app-search-viewer-ui',
  templateUrl: './search-viewer-ui.component.html',
  styleUrls: ['./search-viewer-ui.component.scss']
})
export class SearchViewerUiComponent {
  @Input() doc: string;
  @Input() uri: string;
  @Input() codeMirrorConfig: any;
}
