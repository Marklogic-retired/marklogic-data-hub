import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dashboard-ui',
  templateUrl: './dashboard-ui.component.html',
  styleUrls: ['./dashboard-ui.component.scss']
})
export class DashboardUiComponent {

  @Input() rows: any;
  @Input() databases: any;
  @Input() stats: any;

  @Output() clearDatabase = new EventEmitter();
  @Output() clearAllDatabases = new EventEmitter();

  constructor() {}

  labelify(db) {
    if (db === "job") {
      return "jobs";
    } else {
      return db;
    }
  }
  getDbCount(db) {
    return this.stats[db + 'Count'];
  }

  emitClearDatabase(db) {
    this.clearDatabase.emit(db);
  }

  emitClearAllDatabases() {
    this.clearAllDatabases.emit();
  }
}
