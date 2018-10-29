import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import { SearchResponse } from '../../../search';
import { Job } from '../../../jobs/job.model';
import { JobListenerService } from "../../../jobs";
import { differenceInSeconds } from 'date-fns';

@Component({
  selector: 'app-jobs-ui',
  templateUrl: './jobs-ui.component.html',
  styleUrls: ['./jobs-ui.component.scss'],
})
export class JobsUiComponent {
  @Input() loadingJobs: boolean;
  @Input() searchText: string;
  @Input() searchResponse: SearchResponse;
  @Input() activeFacets: any;
  @Input() jobs: Array<Job>;
  @Input() selectedJobs: string[];
  @Input() jobListener: JobListenerService;

  @Output() searchClicked = new EventEmitter();
  @Output() showConsoleClicked = new EventEmitter();
  @Output() exportJobsClicked = new EventEmitter();
  @Output() deleteJobsClicked = new EventEmitter();
  @Output() pageChanged = new EventEmitter();
  @Output() activeFacetsChange = new EventEmitter();  
  @Output() searchTextChanged = new EventEmitter();
  @Output() showTracesClicked = new EventEmitter();
  @Output() toggleSelectJobClicked = new EventEmitter();


  public getDuration(job: Job): number {
    return differenceInSeconds(job.endTime, job.startTime);
  }

  public getIconClass(flowType: string) {
    if (flowType === 'harmonize') {
      return 'mdi-looks';
    } else if (flowType === 'input') {
      return 'mdi-import';
    }
    return '';
  }  
 
  public hasLiveOutput(job: Job): boolean {
    return this.jobListener.jobHasOutput(job.jobId);
  } 
}
