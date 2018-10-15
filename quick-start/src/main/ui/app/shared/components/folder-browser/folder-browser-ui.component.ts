import {Component, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import { MdlTextFieldComponent } from '@angular-mdl/core';

@Component({
  selector: 'app-folder-browser-ui',
  templateUrl: './folder-browser-ui.component.html',
  styleUrls: ['./folder-browser-ui.component.scss']
})
export class FolderBrowserUiComponent implements OnInit {

  @Input() startPath: string = '.';
  @Input() absoluteOnly: boolean = false;
  @Input() showFiles: boolean = false;
  @Input() currentPath: string = null;
  @Input() isLoading: boolean = false;
  @Input() folders: any[] = null;
  @Input() files: any[] = null;

  @Output() entryClicked = new EventEmitter();
  @Output() fileClicked = new EventEmitter();
  @Output() folderChanged = new EventEmitter();
  @Output() inputPathChanged = new EventEmitter();


  @ViewChild(MdlTextFieldComponent) inputPath: MdlTextFieldComponent;

  constructor() {}

  ngOnInit() {
    this.inputPath.registerOnChange((value: string) => {
      this.inputPathChanged.emit(value);
    });
  }

  onFolderChange(event) {
    this.folderChanged.emit(event);
  }

  onEntryClicked(event) {
    this.entryClicked.emit(event);
  }

  onFileClicked(event) {
    this.fileClicked.emit(event);
  }
}
