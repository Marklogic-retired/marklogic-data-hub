import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'app-search-ui',
  templateUrl: './search-ui.component.html',
  styleUrls: ['./search-ui.component.scss']
})
export class SearchUiComponent {
  @Input() databases: Array<string>;
  @Input() currentDatabase: string;
  @Input() entitiesOnly: boolean;
  @Input() searchText: string;
  @Input() loadingTraces: boolean;
  @Input() searchResponse: any;
  @Input() activeFacets: any;
  @Output() currentDatabaseChanged = new EventEmitter();
  @Output() entitiesOnlyChanged = new EventEmitter();
  @Output() searchTextChanged = new EventEmitter();
  @Output() showDoc = new EventEmitter();
  @Output() uriCopied = new EventEmitter();
  @Output() pageChanged = new EventEmitter();
  @Output() onActiveFacetsChange = new EventEmitter();
  @Output() doSearch = new EventEmitter();
}
