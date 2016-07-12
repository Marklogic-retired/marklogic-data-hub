import { Component, Input, Renderer, trigger,
   state, style, transition, animate } from '@angular/core';
import { Router } from '@angular/router';
import { STOMPService } from '../stomp/stomp.service';

import * as _ from 'lodash';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';
import { InstallService } from '../installer/install.service';

import { FolderBrowser } from '../folder-browser/folder-browser.component';
import { SelectList } from '../select-list/select-list.component';
import { LoginInfo } from './login-info.model';
import { HubSettings } from './hub-settings.model';

@Component({
  selector: 'login',
  templateUrl: './login.template.html',
  directives: [
    FolderBrowser,
    SelectList
  ],
  providers: [AuthService, ProjectService, InstallService, STOMPService],
  styleUrls: ['./login.style.scss'],
  animations: [
    trigger('visibleState', [
      state('hidden', style({
        height: 0,
      })),
      state('active', style({
        height: '*',
      })),
      transition('hidden => active', animate('0.5s ease-in')),
      transition('active => hidden', animate('0.5s ease-in'))
    ]),
  ],
})

export class Login {
  defaultSettings: HubSettings;
  initSettings: HubSettings = new HubSettings();

  currentTab: string = 'ProjectDir';

  visitedTabs = [];

  tabs = {
    ProjectDir: true,
    InitIfNeeded: false,
    Environment: false,
    Login: false,
    InstalledCheck: false,
    Installer: false,
  };


  progressHidden = true;

  environments = ['local', 'dev', 'qa', 'prod'];

  showFolderBrowser = false;

  installationStatus: string = null;

  projects: Array<any>;

  lastProject: any;

  percentComplete: number;

  folder: string;

  project: string;

  currentProject: any = null;

  currentEnvironment: any;

  currentEnvironmentString: string;

  loginInfo: LoginInfo = new LoginInfo();

  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private installService: InstallService,
    private router: Router,
    private renderer: Renderer) {

    projectService.getProjects().subscribe(resp => {
      console.log(resp);
      this.projects = resp.projects;

      if (this.projects.length > 0) {
        if (resp.lastProject) {
          _.each(this.projects, project => {
            if (project.id === resp.lastProject) {
              this.lastProject = project;
            }
          });
        }
      } else {
        this.showFolderBrowser = true;
      }
    });
  }

  install() {
    this.progressHidden = false;

    this.installationStatus = '';
    this.installService.messageEmitter.subscribe((payload) => {
      this.percentComplete = payload.percentComplete;
      this.installationStatus += '\n' + payload.message;

      if (this.percentComplete === 100) {
        setTimeout(() => {
          this.progressHidden = true;
        }, 1000);
      }
    });
    this.installService.install();
  }

  folderClicked(folder) {
    this.folder = folder;
  }

  back() {
    if (this.visitedTabs.length > 0) {
      this.disableTabs();
      this.currentTab = this.visitedTabs.pop();
      console.log('previous tab: ' + this.currentTab);
      this.tabs[this.currentTab] = true;
    }
  }

  gotoTab(tabName) {
    console.log('gotoTab: ' + tabName);
    this.disableTabs();
    this.tabs[tabName] = true;

    if (this.currentTab !== 'InstalledCheck') {
      this.visitedTabs.push(this.currentTab);
    }
    this.currentTab = tabName;
  }

  canProjectNext() {
    return (this.showFolderBrowser && this.folder) ||
      (!this.showFolderBrowser && this.project);
  }

  chooseProject() {
    if (this.showFolderBrowser && this.folder) {
      // create a new project
      this.projectService.addProject(this.folder).subscribe(project => {
        this.gotProject(project);
      });
    } else if (!this.showFolderBrowser && this.project) {
      // select the project
      this.projectService.getProject(this.project).subscribe(project => {
        this.gotProject(project);
      });
    }
  }

  removeProject(project) {
    this.projectService.removeProject(project).subscribe(() => {
      _.remove(this.projects, p => { return p.id === project.id; });
    });
  }

  projectSelected($event) {
    console.log('event');
    console.log(arguments);
  }

  gotProject(project) {
    console.log('gotProject');
    this.currentProject = project;
    if (project.initialized) {
      // go straight to the environment choose
      this.gotoTab('Environment');
    } else {
      this.projectService.getProjectDefaults(this.currentProject.id).subscribe(defaults => {
        this.defaultSettings = defaults;
        this.initSettings = _.clone(defaults);
        // go to the init project tab
        this.gotoTab('InitIfNeeded');
      });
    }
  }

  restoreInitDefaults() {
    // const confirm = this.$mdDialog.confirm()
    //       .title('Are you sure?')
    //       .textContent('Really restore the default settings?')
    //       .ok('Restore')
    //       .cancel('Cancel');
    // this.$mdDialog.show(confirm).then(() => {
      this.initSettings = _.clone(this.defaultSettings);
    // });
  }

  gotEnvironment(environment) {
    this.currentEnvironmentString = environment;
  }

  environmentNext() {
    this.gotoTab('Login');
    setTimeout(() => {
      this.renderer.invokeElementMethod(
        this.renderer.selectRootElement('input#username-input'), 'focus');
    }, 500);
  }

  loginNext() {
    this.gotoTab('InstalledCheck');

    this.projectService.getProjectEnvironment(
      this.currentProject.id,
      this.currentEnvironmentString).subscribe(env => {
      this.currentEnvironment = env;

      if (this.currentEnvironment.installed) {
        // goto login tab
        this.router.navigate(['home']);
      } else {
        // go to install hub tab
        this.gotoTab('Installer');
      }
    });
  }

  initProject() {
    this.projectService.initProject(
      this.currentProject.id,
      this.initSettings).subscribe(project => {
      this.currentProject = project;
      this.gotoTab('Environment');
    });
  }

  login() {
    this.projectService.login(
      this.currentProject.id,
      this.currentEnvironmentString,
      this.loginInfo
    ).subscribe(() => {
        this.auth.setAuthenticated(true);
        this.loginNext();
      },
      error => {
        this.auth.setAuthenticated(false);
      });
  }

  private disableTabs() {
    _.each(this.tabs, (tab, key) => {
      this.tabs[key] = false;
    });
  }
}
