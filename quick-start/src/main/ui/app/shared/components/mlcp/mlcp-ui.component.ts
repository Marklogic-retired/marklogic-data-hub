import {Component, EventEmitter, Input, Output} from '@angular/core';
import { Flow } from '../../../models/flow.model';

@Component({
  selector: 'app-mlcp-ui',
  templateUrl: './mlcp-ui.component.html',
  styleUrls: ['./mlcp-ui.component.scss'],
})
export class MlcpUiComponent {
  @Input() startPath: string;
  @Input() flow: Flow;
  @Input() mlcpOptions: any;
  @Input() hasErrors: boolean;
  @Input() groups: Array<any>;
  @Input() mlcpCommand: string;

  @Output() folderClicked = new EventEmitter();
  @Output() fileClicked = new EventEmitter();
  @Output() saveOptionsClicked = new EventEmitter();
  @Output() valueChanged = new EventEmitter();
  @Output() runImportClicked = new EventEmitter();
  @Output() clipboardSuccess = new EventEmitter();


  sections: any = {
    inputFiles: {
      collapsed: false
    },
    'General Options': {
      collapsed: true
    },
    'Delimited Text Options': {
      collapsed: true
    },
    'Delimited Json Options': {
      collapsed: true
    },
    'Aggregate XML Options': {
      collapsed: true
    },
    'Transform Options': {
      collapsed: true
    }
  };

  getSectionClass(group: string): string {
    const section = this.sections[group];
    return section.collapsed ? 'collapsed' : '';
  }

  toggleSection(group: string): void {
    const section = this.sections[group];
    section.collapsed = !section.collapsed;
  }

  isText(type: string): boolean {
    if (type === 'string' || type === 'comma-list' || type === 'number' || type === 'character') {
      return true;
    }

    return false;
  }

  isGroupVisible(category: string): boolean {
    const inputFileType = this.groups[0].settings[1].value;
    if (category === 'Delimited Text Options' && inputFileType !== 'delimited_text') {
      return false;
    } else if (category === 'Delimited Json Options' && inputFileType !== 'delimited_json') {
      return false;
    } else if (category === 'Aggregate XML Options' && inputFileType !== 'aggregates') {
      return false;
    }
    return true;
  }

  handleValueChanged(setting, event) {
    setting.value = event;
    this.valueChanged.emit();
  }

}
