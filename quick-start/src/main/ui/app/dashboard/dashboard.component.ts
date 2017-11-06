import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProjectService } from '../projects';

import { MdlDialogService } from '@angular-mdl/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // statsInterval: any;
  rows: any = [0, 1];

  databases: any = [
    'staging',
    'final',
    'job',
    'trace'
  ];

  stats: any;

  constructor(
    private ngZone: NgZone,
    private projectService: ProjectService,
    private dialogService: MdlDialogService,
    private router: Router
  ) {
    // this.router.events.subscribe((val:any) => {
    //   // see also
    //   if (val.url !== '/' && this.statsInterval) {
    //     this.stopStats();
    //   }
    // });
  }

  getStatus() {
    this.ngOnDestroy();

    this.projectService.getStatus().subscribe((stats) => {
      this.stats = stats;

      // this.ngZone.runOutsideAngular(() => {
      //   this.statsInterval = setInterval(() => {
          this.projectService.getStatus().subscribe((timerStats) => {
            // this.ngZone.run(() => {
              this.stats = timerStats;
            // });
          });
        // }, 2000);
      // });
    });
  }

  ngOnInit() {
    this.getStatus();
  }

  ngOnDestroy() {
    // this.stopStats();
  }

  // stopStats() {
  //   if (this.statsInterval) {
  //     clearInterval(this.statsInterval);
  //     delete this.statsInterval;
  //   }
  // }

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
