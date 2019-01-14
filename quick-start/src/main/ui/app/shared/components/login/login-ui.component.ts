import {Component, EventEmitter, Input, Output, Renderer2} from "@angular/core";
import * as _ from "lodash";
import {LoginInfo} from "../../../login/login-info.model";
import {HubSettings} from "../../../environment/hub-settings.model";

@Component({
  selector: 'app-login-ui',
  templateUrl: './login-ui.component.html',
  styleUrls: ['./login-ui.component.scss']
})
export class LoginUIComponent {
  @Input() installationStatus: string;
  @Input() currentEnvironment: any;
  @Input() uninstalling: boolean;
  @Input() installing: boolean;
  @Input() percentComplete: number;
  @Input() showInitAdvanced: boolean;
  @Input() showFolderBrowser: boolean = true;
  @Input() projects: Array<any>;
  @Input() currentProject: any;
  @Input() lastProject: any;
  @Input() loggingIn: boolean;
  @Input() loginError: string;
  @Input() loginInfo: LoginInfo;
  @Input() hubUpdating: boolean;
  @Input() hubUpdateFailed: boolean;
  @Input() runningPreinstallCheck: boolean;
  @Input() preinstallCheck: any;
  @Input() initSettings: HubSettings;

  @Output() onPostInitNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChooseProject: EventEmitter<any> = new EventEmitter<any>();
  @Output() onInstall: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUninstall: EventEmitter<any> = new EventEmitter<any>();
  @Output() onInstallNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() onLogin: EventEmitter<any> = new EventEmitter<any>();
  @Output() onHubNameChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() onGotEnvironment: EventEmitter<any> = new EventEmitter<any>();
  @Output() onHubUpdateUrl: EventEmitter<any> = new EventEmitter<any>();
  @Output() onUpdateProject: EventEmitter<any> = new EventEmitter<any>();
  @Output() onProjectSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRemoveProject: EventEmitter<any> = new EventEmitter<any>();
  @Output() onInitProject: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRestoreInitDefaults: EventEmitter<any> = new EventEmitter<any>();
  @Output() onShowFolderBrowser: EventEmitter<any> = new EventEmitter<any>();

  currentEnvironmentString: string;

  constructor(private renderer: Renderer2) {
  }

  tabs: any = {
    ProjectDir: true,
    InitIfNeeded: false,
    PostInit: false,
    Environment: false,
    Login: false,
    InstalledCheck: false,
    PreInstallCheck: false,
    Installer: false,
    RequiresUpdate: false
  };

  currentTab: string = 'ProjectDir';
  visitedTabs: Array<string> = [];

  private disableTabs() {
    _.each(this.tabs, (tab, key) => {
      this.tabs[key] = false;
    });
  }

  back() {
    if (this.visitedTabs.length > 0) {
      this.disableTabs();
      this.currentTab = this.visitedTabs.pop();
      this.tabs[this.currentTab] = true;
    }
  }

  gotoTab(tabName: string): void {
    this.disableTabs();
    this.tabs[tabName] = true;

    const skipUs = ['InstalledCheck', 'InitIfNeeded', 'PostInit', 'PreInstallCheck'];
    if (skipUs.indexOf(this.currentTab) < 0) {
      this.visitedTabs.push(this.currentTab);
    }
    this.currentTab = tabName;
  }

  environmentNext() {
    this.gotoTab('Login');
    setTimeout(() => {
      this.renderer.selectRootElement('input#username').focus();
    }, 500);
  }

  clickShowFolderBrowser() {
    this.showFolderBrowser = !this.showFolderBrowser;
    this.onShowFolderBrowser.emit(this.showFolderBrowser);
  }

  getInstalledIcon(isTrue: boolean) {
    return isTrue ? 'fa-check' : 'fa-close';
  }

  setCurrentEvironmentString(str: string) {
    this.currentEnvironmentString = str;
    this.onGotEnvironment.emit(str);
  }
}
