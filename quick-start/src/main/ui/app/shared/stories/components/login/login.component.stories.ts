import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../utils';
import {FolderBrowserUiComponent, LoginUIComponent, SelectListComponent, ThemeModule} from '../../../components';

storiesOf('Components|Login', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [
        CommonModule,
        ThemeModule
      ],
      schemas: [],
      declarations: [
        LoginUIComponent,
        StoryCardComponent,
        SelectListComponent,
        FolderBrowserUiComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .add('Login Component', () => ({
    template: `
            <mlui-dhf-theme>
              <app-login-ui
                [currentEnvironment]='currentEnvironment'
                [installationStatus]='installationStatus'
                [installing]='installing'
                [percentComplete]='percentComplete'
                [uninstalling]='uninstalling'
                [showInitAdvanced]='showInitAdvanced'
                [showFolderBrowser]='showFolderBrowser'
                [projects]='projects'
                [currentProject]='currentProject'
                [loggingIn]='loggingIn'
                [loginError]='loginError'
                [loginInfo]='loginInfo'
                [initSettings]="initSetting"
                [currentEnvironmentString]="currentEnvironmentString"
                
                (onInstall)='onInstall'
                (onUninstall)='onUninstall'
                (onInstallNext)='onInstallNext'
                (onChooseProject)='onChooseProject'
                (onPostInitNext)='onPostInitNext'
                (onLogin)='onLogin'
                >
                  <app-folder-browser-ui class="app-folder-browser"
                    startPath="/start/path/here"
                    absoluteOnly=true
                    showFiles=true
                    currentPath="current/path"
                    isLoading=false
                    [folders]='this.folders'
                    [files]='this.files'
                  ></app-folder-browser-ui>
                </app-login-ui>
           </mlui-dhf-theme>`,
    props: {
      folders: [{'name': 'Folder1'},
        {'name': 'Folder2'},
        {'name': 'Folder3'},
        {'name': 'Folder4'}
      ],
      files: [
        {'name': 'File 1'},
        {'name': 'File 2'}
      ],
      currentEnvironment: {
        installInfo: {
          installed: true,
          stagingAppServerExists: true,
          finalAppServerExists: true,
          jobAppServerExists: true,
          stagingDbExists: true,
          finalDbExists: true,
          jobDbExists: true,
          stagingTripleIndexOn: false,
          stagingCollectionLexiconOn: false,
          finalTripleIndexOn: false,
          finalCollectionLexiconOn: false,
          stagingForestsExist: true,
          finalForestsExist: true,
          jobForestsExist: true,
          stagingModulesDbExists: true,
          stagingSchemasDbExists: true,
          stagingTriggersDbExists: true
        },
        runningVersion: '1.0.0',
        dhfversion: '4.0.0'
      },
      currentEnvironmentString: 'local',
      installationStatus: text('installationStatus', 'Installation Status Here'),
      installing: boolean('installing', true),
      percentComplete: number('percentComplete', 20),
      uninstalling: boolean('uninstalling', true),
      showInitAdvanced: boolean('showInitAdvanced', true),
      showFolderBrowser: boolean('showFolderBrowser', true),
      projects: object('projects', [{id:1,path:"/path/to/project1"}]),
      currentProject: {
        environments: [
          {"label": 'Item N1'},
          {"label": 'Item N2'},
          {"label": 'Item N3'},
          {"label": 'Item N4'},
          {"label": 'Item N5'}
        ],
        path: '/path/to/project'
      },
      loggingIn: boolean('loggingIn', true),
      loginError: text('loginError', 'Login Error here'),
      loginInfo: object('loginInfo', {username: 'username', password: 'password'}),
      onInstallNext: action('installNext'),
      onInstall: action('onInstall'),
      onUninstall: action('onUninstall'),
      onChooseProject: action('onChooseProject'),
      onPostInitNext: action('onPostInitNext'),
      onLogin: action('onLogin'),
      initSetting: {
        host: 'host name',
        name: 'data-hub',
        stagingDbName: 'stagingDbName',
        stagingTriggersDbName: 'stagingTriggersDbName',
        stagingSchemasDbName: 'stagingSchemasDbName',
        stagingHttpName: 'stagingHttpName',
        stagingForestsPerHost: 10,
        stagingPort: 8013,
        stagingAuthMethod: 'basic',

        finalDbName: 'finalDbName',
        finalTriggersDbName: 'finalTriggersDbName',
        finalSchemasDbName: 'finalSchemasDbName',
        finalHttpName: 'finalHttpName',
        finalForestsPerHost: 10,
        finalPort: 8014,
        finalAuthMethod: 'basic',

        traceDbName: 'traceDbName',
        traceHttpName: 'traceHttpName',
        traceForestsPerHost: 10,
        tracePort: 8014,
        traceAuthMethod: 'basic',

        jobDbName: 'jobDbName',
        jobHttpName: 'jobHttpName',
        jobForestsPerHost: 10,
        jobPort: 8015,
        jobAuthMethod: 'basic',

        modulesDbName: 'modulesDbName',

        username: 'username'
      }
    }
  }))
;
