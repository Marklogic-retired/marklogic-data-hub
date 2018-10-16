import { Component, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects';
import { JobListenerService } from '../jobs/job-listener.service';
import { EnvironmentService } from '../environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  template: `
    <app-header-ui
      [runningJobs]="runningJobs"
      [percentageComplete]="percentageComplete"
      (logout)="this.logout()"
    ></app-header-ui>
  `
})
export class HeaderComponent implements OnDestroy {

  @Input() runningJobs: number;
  @Input() percentageComplete: number;
  //@Output() jobCount = new EventEmitter<number>();
  jobCountSubscription: Subscription;
  percentageSubscription: Subscription;

  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private jobListener: JobListenerService,
    private envService: EnvironmentService,
    private router: Router
  ) {
    this.jobCountSubscription = this.jobListener.getJobCount().subscribe(jobCount => this.runningJobs = jobCount);
    this.percentageSubscription = this.jobListener.getPercentageComplete().subscribe(percentage => this.percentageComplete = percentage);

  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.jobCountSubscription.unsubscribe();
    this.percentageSubscription.unsubscribe();
  }
  gotoJobs() {
    this.router.navigate(['jobs']);
  }

  getRunningJobCount() {
    this.runningJobs = this.jobListener.runningJobCount();
  }

  getPercentComplete() {
    this.percentageComplete = this.jobListener.totalPercentComplete();
  }

  getMarkLogicVersion(): number {
    let version = this.envService.marklogicVersion.substr(0, this.envService.marklogicVersion.indexOf('.'));
    return parseInt(version);
  }

  logout() {
    this.projectService.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['login']);
    });
  }

  isActive(url: string) {
    console.log('header active url', url);
    // if(this.router.url.startsWith(url)){
    //   this.activeLink.emit({true});
    // }
    //this.activeLink.emit(true);

    //return this.router.url.startsWith(url);
    //this.activeLink.emit({ url: this.router.url.startsWith(url)});
  }
}
