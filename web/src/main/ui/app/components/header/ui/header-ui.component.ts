import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { MatDialog } from "@angular/material";
import { Router } from '@angular/router';
import { HubSettings } from "../../../models/hub-settings.model";
import { AboutDialogComponent } from "./about-dialog.component";

@Component({
  selector: 'app-header-ui',
  templateUrl: './header-ui.component.html',
  styleUrls: ['./header-ui.component.scss'],
})
export class HeaderUiComponent {

  @Input() activeCheck: Function;
  @Input() runningJobs: number;
  @Input() percentageComplete: number;
  @Input() settings: HubSettings;

  @Output() logout = new EventEmitter();

  constructor(
    private router: Router,
    public dialog: MatDialog
  ) {}

  logoutClicked() {
    this.logout.emit();
  }

  isActive(url: string): boolean {
    if (url === '/') {
      return this.router.url === url;
    }
    return this.router.url.startsWith(url);
  }

  openAboutDialog(): void {
    const dialogRef = this.dialog.open(AboutDialogComponent, {
      width: '500px',
      data: { settings: this.settings}
    });
  }

}
