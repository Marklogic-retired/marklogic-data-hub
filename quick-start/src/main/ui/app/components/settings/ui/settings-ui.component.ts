import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'app-settings-ui',
  templateUrl: './settings-ui.component.html',
  styleUrls: ['./settings-ui.component.scss'],
})
export class SettingsUiComponent {
  @Input() mlcpPath: string;
  @Input() isMlcpPathValid: boolean;
  @Input() isTraceEnabled: boolean;
  @Input() isDebugEnabled: boolean;
  @Input() installStatus: string;
  @Input() uninstallStatus: string;
  @Input() isPerformingInstallUninstall: boolean;   // isUninstalling || isInstalling
  @Input() percentComplete: number;

  @Output() mlcpPathChanged = new EventEmitter();
  @Output() toggleTrace = new EventEmitter();
  @Output() toggleDebug = new EventEmitter();
  @Output() uninstallClicked = new EventEmitter();
  @Output() redeployClicked = new EventEmitter();
}
