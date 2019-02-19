import { Component, Input, Output, OnInit,
  OnChanges, ViewChild, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { MdlTextFieldComponent } from '@angular-mdl/core';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-folder-browser',
  template: `
    <app-folder-browser-ui
      [startPath]="startPath"
      [absoluteOnly]="absoluteOnly"
      [showFiles]="showFiles"
      [currentPath]="currentPath"
      [isLoading]="isLoading"
      [folders]="folders"
      [files]="files"
      (inputPathChanged)="this.onInputPathChange($event)"
      (entryClicked)="this.entryClicked($event)"
      (fileClicked)="this.fileClicked($event)"
      (folderChanged)="this.onFolderChange($event)"
    ></app-folder-browser-ui>
  `
})
export class FolderBrowserComponent implements OnInit, OnChanges {
  @Input() startPath: string = '.';
  @Input() absoluteOnly: boolean = false;
  @Input() showFiles: boolean = false;

  @Output() folderChosen = new EventEmitter();
  @Output() fileChosen = new EventEmitter();

  @ViewChild(MdlTextFieldComponent) inputPath: MdlTextFieldComponent;

  currentPath: string = null;
  isLoading: boolean = false;
  folders: any[] = null;
  files: any[] = null;

  constructor(private http: Http) {}

  ngOnInit() {
    this.getFolders(this.startPath);
  }

  ngOnChanges(changes: any) {
    if (changes.startPath && changes.startPath.currentValue) {
      this.getFolders(changes.startPath.currentValue);
    }
  }

  onInputPathChange(path) {
    if (this.currentPath !== path) {
      this.currentPath = path;
    }
  }

  onFolderChange(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.getFolders(this.currentPath);
    }
  }

  getFolders(path: string): void {
    if (path) {
      this.isLoading = true;
      this.http.get(`/api/utils/searchPath?path=${encodeURIComponent(path)}`).pipe(
      map(this.extractData))
      .subscribe(resp => {
        this.folders = resp.folders;
        this.files = resp.files;
        this.currentPath = this.absoluteOnly ? resp.currentAbsolutePath : resp.currentPath;
        this.folderChosen.emit({
          relativePath: resp.currentPath,
          absolutePath: resp.currentAbsolutePath
        });
      },
      error => {
        console.log(error);
      },
      () => {
        this.isLoading = false;
      });
    }
  }

  entryClicked(entry: any): void {
    this.getFolders(entry.absolutePath);
  }

  fileClicked(selectedFile: any) {
    this.fileChosen.emit( {
      relativePath: selectedFile.currentPath,
      absolutePath: selectedFile.absolutePath
    })
  }

  private extractData(res: Response) {
    return res.json();
  }
}
