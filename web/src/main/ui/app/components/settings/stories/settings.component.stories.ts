import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {SettingsUiComponent, ThemeModule} from "../..";


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
                  [percentComplete]="percentComplete"
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
      percentComplete: number('percentComplete', 0),
      isMlcpPaisPerformingInstallUninstallthValid: boolean('isPerformingInstallUninstall', false),
      mlcpPathChanged: action('mlcpPathChanged'),
      toggleTrace: action('toggleTrace'),
      toggleDebug: action('toggleDebug'),
      uninstallClicked: action('uninstallClicked'),
      redeployClicked: action('redeployClicked'),
    }
  }));
