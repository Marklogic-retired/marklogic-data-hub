import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { SettingsService } from './settings.service';
import { InstallService } from '../installer/index';

import { ProjectService } from '../projects/index';

import { ConfirmService } from '../confirm/index';

import { TooltipDirective } from '../tooltip/tooltip.directive';

import * as _ from 'lodash';

@Component({
  selector: 'settings',
  templateUrl: './settings.tpl.html',
  directives: [TooltipDirective],
  providers: [],
  styleUrls: ['./settings.style.css'],
})
export class Settings {

  uninstallStatus: string;
  percentComplete: number;

  constructor(
    private settings: SettingsService,
    private install: InstallService,
    private confirm: ConfirmService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  debugEnabled() {
    return this.settings.debugEnabled;
  }

  toggleDebug(checked: boolean): void {
    if (checked !== this.settings.debugEnabled) {
      this.settings.toggleDebugging();
    }
  }

  traceEnabled(): boolean {
    return this.settings.traceEnabled;
  }

  toggleTrace(checked: boolean): void {
    if (checked !== this.settings.traceEnabled) {
      this.settings.toggleTracing();
    }
  }

  uninstall($event: MouseEvent): void {
    this.confirm.showConfirm({
      okText: 'Yes',
      cancelText: 'No',
      title: 'Uninstall?',
      message: 'Uninstall the hub from MarkLogic?'
    }, $event).then(() => {
      this.uninstallStatus = '';
      let emitter = this.install.messageEmitter.subscribe((payload: any) => {
        this.percentComplete = payload.percentComplete;
        this.uninstallStatus += '\n' + payload.message;

        if (this.percentComplete === 100) {
          emitter.unsubscribe();
          setTimeout(() => {
            this.router.navigate(['login']);
          }, 1000);
        }
      });
      this.install.uninstall(this.projectService.projectId, this.projectService.environment);
    }).catch(() => {});
  }
}
