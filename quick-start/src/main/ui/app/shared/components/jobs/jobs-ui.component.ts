import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'app-jobs-ui',
  templateUrl: './jobs-ui.component.html',
  styleUrls: ['./jobs-ui.component.scss'],
})
export class JobsUiComponent {
  @Input() loadingJobs: boolean;
  @Input() searchText: string;
  @Input() searchResponse: any;
  @Input() activeFacets: any;
  @Input() jobs: Array<any>;
  @Input() selectedJobs: string[];

  @Output() searchClicked = new EventEmitter();
  @Output() showConsoleClicked = new EventEmitter();
  @Output() exportJobsClicked = new EventEmitter();
  @Output() deleteJobsClicked = new EventEmitter();
  @Output() pageChanged = new EventEmitter();
  @Output() activeFacetsChange = new EventEmitter();  
  @Output() searchTextChanged = new EventEmitter();
  @Output() showTracesClicked = new EventEmitter();
  @Output() toggleSelectJobClicked = new EventEmitter();

}
