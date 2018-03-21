import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';
import { JobListenerService } from '../jobs/job-listener.service';
import { EnvironmentService } from '../environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private jobListener: JobListenerService,
    private envService: EnvironmentService,
    private router: Router
  ) {}

  gotoJobs() {
    this.router.navigate(['jobs']);
  }

  getRunningJobCount(): number {
    return this.jobListener.runningJobCount();
  }

  getPercentComplete(): number {
    return this.jobListener.totalPercentComplete();
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

  isActive(url: string): boolean {
    if (url === '/') {
      return this.router.url === url;
    }

    return this.router.url.startsWith(url);
  }
}
