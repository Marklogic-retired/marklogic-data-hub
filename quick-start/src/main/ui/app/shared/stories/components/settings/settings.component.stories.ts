import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import { MdlDialogService } from '@angular-mdl/core';
import { EventEmitter } from '@angular/core';
import {
  withKnobs
} from '@storybook/addon-knobs';
import {StoryCardComponent} from '../../utils';
import {ThemeModule} from "../../../components";
import {SettingsComponent} from "../../../components";
import { SettingsService } from '../../../services/settings/settings.service';
import { InstallService } from '../../../services/installer';
import { ProjectService } from '../../../services/projects';
import { STOMPService } from '../../../services/stomp/stomp.service';

import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';


/**
 * Create a mock of each service
 */
class MockSettingsService {

  private _mlcpPath: string = '';
  traceEnabled: boolean = false;
  debugEnabled: boolean = false;

  constructor() { }

  get mlcpPath(): string {
    return this._mlcpPath;
  }

  set mlcpPath(path: string) { this._mlcpPath = path; }

  validateMlcpPath(path: string) { return Observable.of([]) } 

  toggleDebugging() {
    if (this.debugEnabled) {
      this.disableDebugging();
    } else {
      this.enableDebugging();
    }
  }

  toggleTracing() {
    if (this.traceEnabled) {
      this.disableTracing();
    } else {
      this.enableTracing();
    }
  }

  enableDebugging() { 
    this.debugEnabled = true;
  }

  disableDebugging() { 
    this.debugEnabled = false;
  }

  enableTracing() {
    this.traceEnabled = true;
  }

  disableTracing() {
    this.traceEnabled = false;
  }

}

class MockInstallService {
  messageEmitter: EventEmitter<any> = new EventEmitter<any>();

  install() {}
  uninstall() {}
}

class MockProjectService {

}

class MockSTOMPService {

}

class MockMdlDialogService {
  confirm(question: string, declineText?: string, confirmText?: string, title?: string): Observable<void> {
    return Observable.of();
  };
}

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
      providers: [
        { provide: MdlDialogService, useValue: new MockMdlDialogService() }, 
        { provide: SettingsService, useValue: new MockSettingsService() }, 
        { provide: InstallService, useValue: new MockInstallService() }, 
        { provide: ProjectService, useValue: new MockProjectService() }, 
        { provide: STOMPService, useValue: new MockSTOMPService() }
      ]
    })
  )
  .addDecorator(centered)
  .add('Settings Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'640px'" [height]="'675px'">
                <app-settings></app-settings>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: { }
  }));
