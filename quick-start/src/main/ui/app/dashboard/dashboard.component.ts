import { Component, OnDestroy, OnInit } from '@angular/core';

import { ProjectService } from '../projects';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  statsInterval: number;
  rows: any = [0, 1];

  databases: any = [
    'staging',
    'final',
    'job',
    'trace'
  ];

  stats: any;

  constructor(private projectService: ProjectService) {}

  getStatus() {
    this.ngOnDestroy();

    this.projectService.getStatus().subscribe((stats) => {
      this.stats = stats;

      this.statsInterval = setInterval(() => {
        this.projectService.getStatus().subscribe((timerStats) => {
          this.stats = timerStats;
        });
      }, 2000);
    });
  }

  ngOnInit() {
    this.getStatus();
  }

  ngOnDestroy() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      delete this.statsInterval;
    }
  }

  getDbCount(db) {
    return this.stats[db + 'Count'];
  }

  clearDatabase(db) {
    const database = this.stats[db + 'Db'];
    this.projectService.clearDatabase(database).subscribe(() => {
      this.getStatus();
    });
  }

  clearAllDatabases() {
    this.projectService.clearAllDatabases().subscribe(() => {
      this.getStatus();
    });
  }

}
