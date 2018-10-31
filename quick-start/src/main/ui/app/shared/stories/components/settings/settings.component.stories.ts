import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {
  text,
  boolean,
  withKnobs
} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../utils';
import {ThemeModule} from "../../../components";
import {SettingsUiComponent} from "../../../components";


storiesOf('Components|Settings', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, HttpModule],
      schemas: [],
      declarations: [
        SettingsUiComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Settings Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'640px'" [height]="'675px'">
                <app-settings-ui      
                  [mlcpPath]=""
                  [isMlcpPathValid]="isMlcpPathValid"
                  [isTraceEnabled]="isTraceEnabled"
                  [isDebugEnabled]="isDebugEnabled"
                  [isPerformingInstallUninstall]="isPerformingInstallUninstall"
                  (mlcpPathChanged)="mlcpPathChanged($event)"
                  (toggleTrace)="toggleTrace($event)"
                  (toggleDebug)="toggleDebug($event)"
                  (uninstallClicked)="uninstallClicked()"
                  (redeployClicked)="redeployClicked()"
                ></app-settings-ui>  
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: { 
      mlcpPath: text('mlcpPath', 'mlcpPath'),
      isMlcpPathValid: boolean('isMlcpPathValid', undefined),
      isTraceEnabled: boolean('isTraceEnabled', true),
      isDebugEnabled: boolean('isDebugEnabled', true),
      isMlcpPaisPerformingInstallUninstallthValid: boolean('isPerformingInstallUninstall', false),
      mlcpPathChanged: action('mlcpPathChanged'),
      toggleTrace: action('toggleTrace'),
      toggleDebug: action('toggleDebug'),
      uninstallClicked: action('uninstallClicked'),
      redeployClicked: action('redeployClicked'),
    }
  }));
