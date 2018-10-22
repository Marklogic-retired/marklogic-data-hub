import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import { MdlDialogService } from '@angular-mdl/core';
import {
  object,
  text,
  boolean,
  number,
  withKnobs
} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../utils';
import {ThemeModule} from "../../../components";
import {SettingsComponent} from "../../../components";
import { SettingsService } from '../../../services/settings/settings.service';
import { InstallService } from '../../../services/installer';
import { ProjectService } from '../../../services/projects';
import { STOMPService } from '../../../services/stomp/stomp.service';
import { RouterTestingModule } from '@angular/router/testing';


storiesOf('Components|Settings', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, HttpModule, RouterTestingModule],
      schemas: [],
      declarations: [
        SettingsComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: [MdlDialogService, SettingsService, InstallService, ProjectService, STOMPService]
    })
  )
  .addDecorator(centered)
  .add('Settings Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'500px'" [height]="'250px'">
                <app-settings></app-settings>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      installStatus: text('installStatus', ''),
      uninstallStatus: text('uninstallStatus', ''),
      percentComplete: number('percentComplete', 0),
      isInstalling: boolean('isInstalling', false),
      isUninstalling: boolean('isUninstalling', false),
      isMlcpPathValid: boolean('isMlcpPathValid', false)
    }
  }));
