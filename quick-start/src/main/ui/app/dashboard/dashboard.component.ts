import { Component, OnDestroy, OnInit } from '@angular/core';

import { ProjectService } from '../projects';

import { MdlDialogService } from 'angular2-mdl';

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

  constructor(
    private projectService: ProjectService,
    private dialogService: MdlDialogService
  ) {}

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
    const message = `Do you really want to remove all files from your ${db} Database?`;
    this.dialogService.confirm(message, 'Cancel', 'Clear!').subscribe(() => {
      const database = this.stats[db + 'Db'];
      this.projectService.clearDatabase(database).subscribe(() => {
        this.getStatus();
      });
    },
    () => {});
  }

  clearAllDatabases() {
    const message = 'Do you really want to remove all files from all of your Data Hub Databases?';
    this.dialogService.confirm(message, 'Cancel', 'Clear!').subscribe(() => {
      this.projectService.clearAllDatabases().subscribe(() => {
        this.getStatus();
      });
    },
    () => {});
  }

}
